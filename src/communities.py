import polars as pl
import pandas as pd
from itertools import combinations
from tqdm import tqdm
import networkx as nx
import community as community_louvain

def get_target_mapping(
    videos_df: pl.DataFrame, channels_df: pl.DataFrame, target_type: str
) -> dict:
    """
    Create a mapping from display_id to the target (game or channel name).

    Args:
        videos_df (pl.DataFrame): DataFrame with 'display_id' and target columns ('video_game' or 'channel_id').
        channels_df (pl.DataFrame): DataFrame with 'channel_id' and 'channel_name' for channel name mapping.
        target_type (str): Either 'game' or 'channel' to specify the target column.

    Returns:
        dict: A dictionary mapping display_id to the target (game or channel name).
    """
    # Ensure channels_df is a Polars DataFrame
    if isinstance(channels_df, pd.DataFrame):
        channels_df = pl.from_pandas(channels_df)

    if target_type == "game":
        target_column = "video_game"
        joined_df = videos_df.select(["display_id", target_column])
    elif target_type == "channel":
        # Join videos_df with channels_df to get channel_name
        joined_df = videos_df.join(channels_df, on="channel_id").select(
            ["display_id", "channel_name"]
        )
        target_column = "channel_name"
    else:
        raise ValueError("Invalid target_type. Must be 'game' or 'channel'.")

    # Convert to pandas and create the mapping
    df = joined_df.to_pandas()
    return dict(zip(df["display_id"], df[target_column]))


def filter_valid_comments(
    comments_df: pl.DataFrame, valid_display_ids: pl.Series
) -> pl.DataFrame:
    """
    Filter comments to only those that match valid video IDs.

    Args:
        comments_df (pl.DataFrame): DataFrame with 'author' and 'video_id' columns.
        valid_display_ids (pl.Series): Series of valid video IDs.

    Returns:
        pl.DataFrame: Filtered comments DataFrame.
    """
    return comments_df.filter(pl.col("video_id").is_in(valid_display_ids))


def map_comments_to_target(
    comments_df: pl.DataFrame, display_id_to_target: dict, target_type: str
) -> pl.DataFrame:
    """
    Map video_id in comments to the target (game or channel name).

    Args:
        comments_df (pl.DataFrame): DataFrame with 'author' and 'video_id' columns.
        display_id_to_target (dict): Mapping of display_id to target (game or channel name).
        target_type (str): The target type, either 'game' or 'channel'.

    Returns:
        pl.DataFrame: Comments DataFrame with the target column added.
    """

    def get_target(display_id: str):
        return display_id_to_target.get(display_id, None)

    return comments_df.with_columns(
        pl.col("video_id").map_elements(get_target, return_dtype=str).alias(target_type)
    ).drop_nulls(subset=[target_type]).drop("video_id")


def compute_edges(comments_with_target: pl.DataFrame, target_type: str) -> list:
    """
    Compute edges based on shared users who comment on multiple targets (games or channels).

    Args:
        comments_with_target (pl.DataFrame): DataFrame with 'author' and target column.
        target_type (str): The target type, either 'game' or 'channel'.

    Returns:
        list: Sorted list of edges with their weights.
    """
    rows = comments_with_target.shape[0]
    curr_author = None
    targets = set()
    edges = {}
    authors = 0

    # Select only 'author' and the target column
    comments_iter = comments_with_target.iter_rows()

    for author, target in comments_iter:
        if author != curr_author:
            curr_author = author
            if len(targets) > 1:
                for edge in combinations(targets, 2):
                    edge = tuple(sorted(edge))
                    edges[edge] = edges.get(edge, 0) + 1
            targets = set()
            authors += 1

        targets.add(target)

    return sorted(edges.items(), key=lambda x: x[1], reverse=True)


def create_edges_df(sorted_edges: list, target_type: str) -> pl.DataFrame:
    """
    Create a Polars DataFrame from the sorted edges.

    Args:
        sorted_edges (list): List of edges with their weights.
        target_type (str): The target type, either 'game' or 'channel'.

    Returns:
        pl.DataFrame: A DataFrame with columns for the two targets and the weight.
    """
    return pl.DataFrame(
        {
            f"{target_type}1": [edge[0][0] for edge in sorted_edges],
            f"{target_type}2": [edge[0][1] for edge in sorted_edges],
            "weight": [edge[1] for edge in sorted_edges],
        }
    )


import pandas as pd

def process_game_weights(weights_df: pd.DataFrame, top20games_df: pd.DataFrame) -> pd.DataFrame:
    """
    Process game weights to filter, add reverse edges, self-loops, and merge popularity data.

    Args:
        weights_df (pd.DataFrame): DataFrame with columns ['game1', 'game2', 'weight'].
        top20games_df (pd.DataFrame): DataFrame with columns ['video_game', 'count'] where 'video_game' is the game name
                                      and 'count' is the popularity measure for each game.

    Returns:
        pd.DataFrame: Processed DataFrame with filtered edges, reverse edges, self-loops, and popularity data.
    """
    
    # Filter edges where both games exist in the top20games_df
    filtered_weights_df = weights_df[weights_df['game1'].isin(top20games_df['video_game']) & 
                                      weights_df['game2'].isin(top20games_df['video_game'])]

    # Add reverse edges (swap game1 and game2)
    reverse_edges_df = filtered_weights_df.rename(columns={'game1': 'game2', 'game2': 'game1'})
    reverse_edges_df['weight'] = filtered_weights_df['weight']  # Ensure the weight remains the same

    # Concatenate reverse edges with the original filtered edges
    filtered_weights_df = pd.concat([filtered_weights_df, reverse_edges_df], ignore_index=True)

    # Add self-loops with a weight of 0
    additional_rows = pd.DataFrame({'game1': top20games_df['video_game'], 
                                    'game2': top20games_df['video_game'], 
                                    'weight': 0})

    # Concatenate self-loops with the filtered edges
    filtered_weights_df = pd.concat([filtered_weights_df, additional_rows], ignore_index=True)

    # Merge popularity data for game1 and game2
    filtered_weights_df = filtered_weights_df.merge(top20games_df[['video_game', 'count']], 
                                                     left_on='game1', right_on='video_game', how='left') \
                                               .rename(columns={'count': 'popularity_game1'})
    filtered_weights_df = filtered_weights_df.merge(top20games_df[['video_game', 'count']], 
                                                     left_on='game2', right_on='video_game', how='left') \
                                               .rename(columns={'count': 'popularity_game2'})

    # Sort by popularity of game1 and game2 in descending order
    filtered_weights_df = filtered_weights_df.sort_values(by=['popularity_game1', 'popularity_game2'], 
                                                           ascending=[False, False]).reset_index(drop=True)
    
    # Drop unnecessary columns
    drop_columns = ['video_game_x', 'popularity_game1', 'video_game_y', 'popularity_game2']
    filtered_weights_df = filtered_weights_df.drop(columns=drop_columns)

    return filtered_weights_df

def adjust_weight(edges: pl.DataFrame, popularity: dict, threshold: int, alpha: float, beta: float = 1.0) -> dict:
    adjusted_edges = {}
    for edge in edges.iter_rows():
        game1, game2, weight = edge
        # Get the popularity of the games
        p1 = popularity[game1] if game1 in popularity else 1
        p2 = popularity[game2] if game2 in popularity else 1
        # Adjust the weight using the formula
        adjusted_weight = int((weight ** beta) * ((min(p1, p2) / max(p1, p2)) ** alpha))
        if adjusted_weight > threshold:
            adjusted_edges[(game1, game2)] = adjusted_weight
    return adjusted_edges


def adjust_and_display_edges(edges: pl.DataFrame, popularity: dict, threshold: int, alpha: float, beta: float = 1.0):
    """
    Adjust the weights of edges based on node (game or channel) popularity and display before/after adjustments.

    Args:
        edges (pl.DataFrame): DataFrame containing edges with 'node1', 'node2', and 'weight'.
        popularity (dict): Dictionary mapping node names (games or channels) to their popularity.
        threshold (int): Popularity threshold for adjusting the weights.
        alpha (float): Adjustment factor for the weight based on the relative popularity.
        beta (float): Exponent for the weight adjustment (default 1.0).
        node_type (str): Type of nodes ('game' or 'channel') for labeling purposes.

    Returns:
        dict: Adjusted edges with weights.
    """

    # Adjust weights using the provided adjust_weight function
    adjusted_edges = adjust_weight(edges, popularity, threshold, alpha, beta)

    # Create a dictionary of edges before adjustment
    edges_dict = {}
    for edge in edges.iter_rows():
        
        node1, node2, weight = edge
        edges_dict[(node1, node2)] = weight

    # Collect unique nodes from the adjusted edges
    unique_nodes = set()
    for edge in adjusted_edges:
        unique_nodes.add(edge[0])
        unique_nodes.add(edge[1])

    return adjusted_edges


def create_and_detect_communities(adjusted_edges: dict, popularity: dict, max_iter: int = 500, random_state: int = 42):
    """
    Creates a graph from adjusted edges, computes node positions using the Fruchterman-Reingold layout,
    and performs community detection using the Louvain method.

    Args:
        adjusted_edges (dict): Dictionary with (game1, game2) as keys and weights as values.
        popularity (dict): Dictionary with game names as keys and their popularity as values.
        max_iter (int): Maximum number of iterations for the Fruchterman-Reingold layout (default 500).
        random_state (int): Random seed for reproducibility (default 42).

    Returns:
        dict: A partition dictionary with nodes as keys and community ids as values.
        dict: Positions for each node in the graph (from the Fruchterman-Reingold layout).
    """
    # Create graph
    G = nx.Graph()
    for (source, target), weight in adjusted_edges.items():
        G.add_edge(source, target, weight=weight)

    # Add node size (popularity) as a node attribute, normalized by 2000
    for node in G.nodes():
        G.nodes[node]['size'] = popularity.get(node, 0) / 2000

    # Compute positions using Fruchterman-Reingold (forceatlas2 layout)
    positions = nx.forceatlas2_layout(G, max_iter=max_iter, seed=random_state, dissuade_hubs=True, jitter_tolerance=0.6, gravity=50)

    # Community detection using Louvain method
    partition = community_louvain.best_partition(G, random_state=random_state)

    return partition, positions

import networkx as nx

def create_graph_from_edges(adjusted_edges: dict) -> nx.Graph:
    """
    Create a NetworkX graph from a dictionary of edges with weights.

    Args:
        adjusted_edges (dict): Dictionary with keys as (source, target) tuples and values as weights.

    Returns:
        nx.Graph: A NetworkX graph with the given edges and weights.
    """
    G = nx.Graph()
    for (source, target), weight in adjusted_edges.items():
        G.add_edge(source, target, weight=weight)
    return G








