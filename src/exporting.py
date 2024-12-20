import pandas as pd
import polars as pl
import numpy as np
import json


def export_all(
    pie_chart_data_df,
    videos_sample_df,
    tags,
    games_info,
    dedication_ratio_df,
    like_dislikes_ratio_df,
    posting_rate_df,
    genre_counts_df,
    co_occurrence_matrix,
    G_games,
    games_partition,
    games_popularities,
    games_positions,
    G_channels,
    channels_partition,
    channels_popularities,
    channels_positions
):
    """
    Exports all the data to JSON files for the data story website.
    
    Args:
        pie_chart_data_df (pd.DataFrame): The DataFrame containing category percentages.
        videos_sample_df (pd.DataFrame): DataFrame containing the video data with a 'duration' column.
        tags (pd.DataFrame): DataFrame containing tags and counts.
        games_info (dict): Dictionary containing game metadata (e.g., Release Date, Genre, Studio).
        dedication_ratio_df (pl.DataFrame): DataFrame containing dedication rate for each game.
        like_dislikes_ratio_df (pl.DataFrame): DataFrame containing likes/dislikes ratio for each game.
        posting_rate_df (pl.DataFrame): DataFrame containing posting rate for each game.
        genre_counts_df (pd.DataFrame): DataFrame containing genres and their corresponding counts.
        co_occurrence_matrix (pd.DataFrame): A symmetric co-occurrence matrix (DataFrame) where the index and columns represent genres.
        G_games (networkx.Graph): The graph representing the games network.
        games_partition (dict): A dictionary mapping games to their communities or categories.
        games_positions (dict): A dictionary mapping games to their positions (coordinates).
        G_channels (networkx.Graph): The graph representing the channels network.
        channels_partition (dict): A dictionary mapping channels to their communities or categories.
        channels_positions (dict): A dictionary mapping channels to their positions (coordinates).
    
    """
    export_category_percentages_to_json(pie_chart_data_df)
    export_video_durations_to_json(videos_sample_df)
    export_tags_to_json(tags)
    export_top_3_stats_to_json(
        games_info, dedication_ratio_df, like_dislikes_ratio_df, posting_rate_df
    )
    export_genre_counts_to_json(genre_counts_df)
    export_co_occurrence_matrix(co_occurrence_matrix)
    export_network_json(
        G_games,
        games_positions,
        games_popularities,
        games_partition,
        output_path="../website/data/games_network.json",
    )
    export_network_json(
        G_channels,
        channels_positions,
        channels_popularities,
        channels_partition,
        output_path="../website/data/channels_network.json",
    )


"""-------------------------------------Pie chart---------------------------------------"""


def export_category_percentages_to_json(
    pie_chart_data_df, output_path="../datastory/data/category_percentages.json"
):
    """
    Exports the pie chart data DataFrame to a JSON file.

    Args:
        pie_chart_data_df (pd.DataFrame): The DataFrame containing category percentages.
        output_path (str): The file path to save the JSON file.
    """
    pie_chart_data_df.to_json(output_path, orient="records")
    print(f"Category percentages successfully exported to {output_path}")


"""-------------------------------------Video duration---------------------------------------"""


def export_video_durations_to_json(
    videos_sample_df, output_file="../website/data/video_durations.json"
):
    """
    Filters the videos based on duration, creates duration bins, and exports the result to a JSON file.

    Args:
        videos_sample_df (pd.DataFrame): DataFrame containing the video data with a 'duration' column.
        output_file (str): Path where the output JSON file will be saved.
    """
    # Convert to pandas
    df = videos_sample_df.to_pandas()

    # Filter the DataFrame to be less than or equal to 1 hour (3600 seconds)
    filtered_df = df[df["duration"] <= 3600]

    # Define bins as multiples of 10 starting from 0 up to the maximum duration in the filtered DataFrame
    max_duration = int(np.ceil(filtered_df["duration"].max()))
    bin_edges = np.arange(0, max_duration + 10, 10)  # Bins in steps of 10

    # Bin the durations of the filtered DataFrame
    bin_counts, bin_edges = np.histogram(filtered_df["duration"], bins=bin_edges)

    # Use the end of each bin as the label
    bin_labels = bin_edges[1:]

    # Create the JSON data structure
    output_data = {"xAxisData": bin_labels.tolist(), "seriesData": bin_counts.tolist()}

    # Export to JSON file
    with open(output_file, "w") as f:
        json.dump(output_data, f, indent=4)

    print(f"Video durations JSON export completed successfully to {output_file}.")


"""-------------------------------------Tags for WordCloud---------------------------------------"""


def export_tags_to_json(tags_df, output_file="../website/data/word_cloud.json"):
    """
    Renames columns of the tags DataFrame and exports it to a JSON file.

    Args:
        tags_df (pd.DataFrame): DataFrame containing tags and counts.
        output_file (str): Path where the output JSON file will be saved.

    Returns:
        None
    """
    # Rename columns and convert to JSON
    tags_df.to_pandas().rename(columns={"tags": "name", "count": "value"}).to_json(
        output_file, orient="records"
    )

    print(f"Tags export completed successfully to {output_file}.")


### def export_weekly_views_json(channels_top_game_df, timeseries_df, games, cutoff="2017-01-01", output_file="weekly_delta_views.json"):

"""-------------------------------------Top 3 Games---------------------------------------"""


def export_top_3_stats_to_json(
    games_info,
    dedication_ratio_df,
    like_dislikes_ratio_df,
    posting_rate_df,
    output_path="../website/data/top3_stats.json",
):
    """
    Generate statistics for the top 3 games and format them into a structured dictionary,
    then return it as a JSON string.

    Args:
        games_info (dict): Dictionary containing game metadata (e.g., Release Date, Genre, Studio).
        dedication_ratio_df (pl.DataFrame): DataFrame containing dedication rate for each game.
        like_dislikes_ratio_df (pl.DataFrame): DataFrame containing likes/dislikes ratio for each game.
        posting_rate_df (pl.DataFrame): DataFrame containing posting rate for each game.

    Returns:
        str: A JSON string with game statistics formatted for the top 3 games.
    """
    export_data = {"games": {}}

    for game, metadata in games_info.items():
        # Filter and extract values using polars syntax
        dedication_rate = (
            dedication_ratio_df.filter(pl.col("video_game") == game)
            .select("percentage")
            .item(0, 0)
        )
        ratio_likes_dislikes = (
            like_dislikes_ratio_df.filter(pl.col("video_game") == game)
            .select("like_dislike_ratio")
            .item(0, 0)
        )
        posting_rate = (
            posting_rate_df.filter(pl.col("video_game") == game)
            .select("percentage")
            .item(0, 0)
        )

        # Format the data into the required structure for the top 3 games
        export_data["games"][game] = {
            "stats": [
                {"label": "Release Date", "value": metadata["Release Date"]},
                {"label": "Genre", "value": metadata["Genre"]},
                {"label": "Studio", "value": metadata["Studio"]},
                {"label": "Dedication Rate", "value": f"{dedication_rate}%"},
                {"label": "Ratio likes/dislikes", "value": ratio_likes_dislikes},
                {"label": "Posting Rate", "value": f"{posting_rate}%"},
            ]
        }

    # Save the data as a JSON file
    with open(output_path, "w") as json_file:
        json.dump(export_data, json_file, indent=4)

    print(f"Data exported to {output_path}")


"""-------------------------------------Genres---------------------------------------"""


def export_genre_counts_to_json(
    genre_counts_df, output_path="../website/data/histogram_genres.json"
):
    """
    Exports the genre counts (genres and their counts) as a JSON file for bar chart visualization.

    Args:
        genre_counts_df (pd.DataFrame): DataFrame containing genres and their corresponding counts.
        export_path (str): The path where the JSON file will be saved (default is "../website/data/histogram_genres.json").
    """
    # Extract lists for genres and their counts
    genres_list = genre_counts_df["Genres"].to_list()
    count_list = genre_counts_df["count"].to_list()

    # Prepare the JSON export structure
    export_data = {
        "genres": genres_list,
        "count": count_list,
    }

    # Save the data as a JSON file
    with open(output_path, "w") as json_file:
        json.dump(export_data, json_file, indent=4)

    print(f"Genre counts histrogram data succesfully exported to {output_path}")


def export_co_occurrence_matrix(
    co_occurrence_matrix, export_path="../website/data/cooccurence_matrix.json"
):
    """
    Exports the co-occurrence matrix as a JSON file in the Nivo chord chart format.

    Args:
        co_occurrence_matrix (pd.DataFrame): A symmetric co-occurrence matrix (DataFrame) where the index and columns represent genres.
        export_path (str): The path where the JSON file will be saved.
    """
    # Convert the co-occurrence matrix to a list of lists
    data = co_occurrence_matrix.values.tolist()

    # Get the genres (keys) from the index
    keys = co_occurrence_matrix.index.tolist()

    # Prepare the JSON export structure
    export_data = {
        "data": data,
        "keys": keys,
    }

    # Save the data as a JSON file
    with open(export_path, "w") as json_file:
        json.dump(export_data, json_file, indent=4)

    print(f"Co-occurence matrix successfully exported to {export_path}")


"""-------------------------------------Communities---------------------------------------"""

import json


def export_network_json(G, positions, popularity, partition, output_path):
    """
    Exports the network data (nodes, edges, and categories) to a JSON file for visualization.

    Args:
        G (networkx.Graph): The graph representing the network (games or channels).
        positions (dict): A dictionary mapping nodes to their positions (coordinates).
        popularity (dict): A dictionary mapping nodes to their popularity (e.g., views, likes).
        partition (dict): A dictionary mapping nodes to their communities or categories.
        node_type (str): Type of nodes in the network, either 'game' or 'channel'. Defaults to 'game'.
        output_path (str): The file path where the JSON data will be saved. Defaults to '../datastory/data/games_network.json'.

    Returns:
        None
    """
    # Prepare nodes and edges for JSON output
    nodes = []
    node_map = {}  # Maps node names to IDs

    for i, (node, pos) in enumerate(positions.items()):
        node_map[node] = str(i)
        pop = popularity.get(node, 0)  # Default to 0 if popularity is missing
        nodes.append(
            {
                "id": str(i),
                "name": node,
                "x": pos[0] * 1000,  # Scale positions for better visualization
                "y": pos[1] * 1000,
                "symbolSize": (pop / 2000)
                ** 0.5,  # Example: size proportional to degree
                "value": pop,
                "category": partition.get(node, "Unknown"),
            }
        )

    # Prepare edges
    edges = [
        {"source": node_map[source], "target": node_map[target]}
        for source, target in G.edges()
    ]

    # Prepare categories
    categories = [{"name": name} for name in set(partition.values())]

    # Create the final output data structure
    output = {"nodes": nodes, "edges": edges, "categories": categories}


    # Save the data to a JSON file
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Network JSON successfully exported to {output_path}")


# Example usage:
# export_network_json(G, positions, popularity, partition, node_type="game")
