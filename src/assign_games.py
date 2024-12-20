import pandas as pd
import polars as pl
import matplotlib.pyplot as plt
import string
from tqdm import tqdm

def filter_and_sort_games_by_plays(games_df, cutoff=2000):
    """
    Converts 'Plays' to numeric, sorts games by play count, and limits the DataFrame to the top N rows.

    Args:
        games_df (pd.DataFrame): The DataFrame containing a 'Plays' column.
        cutoff (int): The number of top rows to retain.

    Returns:
        pd.DataFrame: The processed and trimmed DataFrame.
    """
    # Convert 'Plays' column to numeric
    games_df["Plays_Numeric"] = games_df["Plays"].apply(
        lambda x: (
            float(x.replace("k", "").replace("K", "")) * 1000
            if "k" in x or "K" in x
            else float(x)
        )
    )

    # Sort the DataFrame and drop the helper column
    games_df = games_df.sort_values(by="Plays_Numeric", ascending=False).drop(
        columns=["Plays_Numeric"]
    )

    # Keep only the top 'cutoff' rows
    return games_df.iloc[:cutoff]


def filter_games_by_title(games_df, words_path, min_title_length=4):
    """
    Filters the games DataFrame to exclude rows where:
    - The title length is <= min_title_length.
    - The title (case-insensitive) is in a set of words from a file.

    Args:
        games_df (pd.DataFrame): The DataFrame containing a 'Title' column.
        words_path (str): Path to the file containing words to exclude (one per line).
        min_title_length (int): Minimum allowed length for titles. Defaults to 4.

    Returns:
        pd.DataFrame: The filtered DataFrame.
    """
    # Load words from file into a set
    with open(words_path, "r") as f:
        words = {line.strip().lower() for line in f}

    # Filter the DataFrame
    filtered_games_df = games_df[
        (games_df["Title"].str.len() > min_title_length)
        & ~(games_df["Title"].str.lower().isin(words))
    ].reset_index(drop=True)

    return filtered_games_df


def filter_unique_games(games_df):
    """
    Removes rows where the 'Title' is a substring of any other 'Title' in the DataFrame.

    Args:
        games_df (pd.DataFrame): The DataFrame containing a 'Title' column.

    Returns:
        pd.DataFrame: A filtered DataFrame containing only unique titles.
    """
    # Filter rows where 'Title' is not a substring of any other title
    games_df = games_df[
        games_df["Title"].apply(
            lambda x: not any(other in x for other in games_df["Title"] if x != other)
        )
    ].reset_index(drop=True)

    return games_df


"""This file contains useful fuctions for the main notebook."""


def preprocess_name(name: str) -> str:
    """
    Convert to lowercase and remove punctuation from the name.

    Args:
        name: str - name of the game

    Returns:
        str - processed name
    """
    return (
        name.lower()
        .replace(",", " ")
        .translate(str.maketrans("", "", string.punctuation))
    )


def map_to_game(title: str, tags: str, game_titles: list[str]) -> str:
    """
    Map the video to a game based on the title and tags.

    Args:
        title: str - title of the video
        tags: str - list of tags of the video
        game_titles: list[str] - list of game titles to search for

    Returns:
        str - name of the game if the video is related to a game, else None.
    """
    for game in game_titles:
        if game in title:
            return game

    matched_games = []
    for game in game_titles:
        if game in tags:
            matched_games.append(game)
    if len(matched_games) == 1:
        return matched_games[0]
    else:
        return None


def w_pbar(pbar, func):
    """
    Add a progress bar to visuallize progress of a function.

    Args:
        pbar: tqdm - tqdm progress bar object
        func: function - function to add progress bar to

    Returns:
        function - function with progress
    """

    def foo(*args, **kwargs):
        pbar.update(1)
        return func(*args, **kwargs)

    return foo


def preprocess_video_data(videos_sample_df, games_df, preprocess_name):
    """
    Applies the preprocess_name function to the 'title' and 'tags' columns of videos_sample_df,
    and to the 'Title' column of games_df.

    Args:
        videos_sample_df (pl.DataFrame): The DataFrame containing video information.
        games_df (pd.DataFrame): The DataFrame containing game information.
        preprocess_name (function): The preprocessing function to apply to titles and tags.

    Returns:
        pl.DataFrame, list: The processed videos_sample_df and the list of processed game titles.
    """
    # Apply the preprocessing function to 'title' and 'tags' columns of videos_sample_df
    videos_sample_df = videos_sample_df.with_columns(
        pl.col("title").map_elements(preprocess_name),
        pl.col("tags").map_elements(preprocess_name),
    )

    # Apply the preprocessing function to the 'Title' column of games_df and convert it to a list
    game_titles = games_df["Title"].progress_apply(preprocess_name).tolist()

    return videos_sample_df, game_titles


def classify_videos_with_games(videos_df, game_titles):
    """
    Classifies videos by associating them with games based on titles and tags.

    Args:
        videos_df (pl.DataFrame): The DataFrame containing 'title' and 'tags' columns.
        game_titles (list): A list of game titles for classification.

    Returns:
        pl.DataFrame: A DataFrame with a new 'video_game' column and no null values in 'video_game'.
    """
    progress_bar = tqdm(total=len(videos_df), desc="Classifying videos")

    # Apply the mapping
    with_game_df = videos_df.with_columns(
        [
            pl.struct(["title", "tags"])
            .map_elements(
                w_pbar(
                    progress_bar,
                    lambda row: map_to_game(row["title"], row["tags"], game_titles),
                ),
                return_dtype=str,
            )
            .alias("video_game")
        ]
    ).drop_nulls(subset="video_game")

    progress_bar.close()

    # Print the classification percentage
    percentage = len(with_game_df) / len(videos_df) * 100
    print(f"Percentage of classified games over the sample: {percentage:.2f}%")

    return with_game_df


def get_top_game_per_channel(with_game_df, top_n=10):
    """
    Computes the top game for each channel and returns the top N most frequent games across channels.

    Args:
        with_game_df (pl.DataFrame): The DataFrame containing 'channel_id' and 'video_game' columns.
        top_n (int): The number of top games to return based on frequency. Defaults to 10.

    Returns:
        pl.DataFrame: A DataFrame containing the top N most frequent games and their counts.
    """
    # Group by channel_id and video_game, count plays, and sort within each channel
    top_game_per_channel_df = (
        with_game_df.group_by(["channel_id", "video_game"])
        .agg(pl.count().alias("play_count"))
        .sort(["channel_id", "play_count"], descending=True)
        .group_by("channel_id")
        .agg(pl.col("video_game").first().alias("top_game"))
    )

    return top_game_per_channel_df


def game_percentage(df: pl.DataFrame):
    """
    Returns the percentage of videos games associated with channels or videos
    Args:
        df(pl.DataFrame): videos or channels dataframe
    Returns:
        with_game_counts(pl.DataFrame): the percentage of videos games associated with channels or videos
    """

    column_name = "video_game"
    with_game_counts = (
        df.get_column(column_name).value_counts().sort("count", descending=True)
    )
    with_game_counts = with_game_counts.with_columns(
        (100 * pl.col("count") / len(df)).alias("percentage")
    )

    with_game_counts = (
        with_game_counts.with_columns(pl.col("percentage").round(2))
        .drop("count")
        .sort("percentage", descending=True)
    )
    return with_game_counts


def calculate_percentage(
    df: pl.DataFrame, count_column: str, new_column: str = "percentage"
) -> pl.DataFrame:
    """
    Calculates the percentage of each count relative to the total sum of counts.

    Args:
        df: pl.DataFrame - DataFrame containing the counts.
        count_column: str - The name of the column containing the counts.
        new_column: str - The name of the new column to store percentages (default is 'percentage').

    Returns:
        pl.DataFrame - The original DataFrame with an additional 'percentage' column.
    """
    total_count = df[count_column].sum()
    return df.with_columns(
        ((pl.col(count_column) / total_count) * 100).round(2).alias(new_column)
    )
