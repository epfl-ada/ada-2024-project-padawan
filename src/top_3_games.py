import polars as pl
import pandas as pd


def count_videos_per_game(with_game_df: pl.DataFrame) -> pl.DataFrame:
    """
    Function to count the number of videos per game.

    Parameters:
    - with_game_df (pl.DataFrame): DataFrame containing game data with 'video_game'.

    Returns:
    - pl.DataFrame: A DataFrame containing the count of videos per game.
    """
    # Group by 'video_game' and count the number of videos
    game_counts_per_channel = with_game_df.group_by(["channel_id", "video_game"]).agg(
        pl.count().alias("video_count")
    )
    game_counts_per_channel = game_counts_per_channel.sort(
        "video_count", descending=True
    )
    return game_counts_per_channel


def calculate_game_channel_percentage(
    game_counts_per_channel: pl.DataFrame,
    main_game_per_channel: pl.DataFrame,
    target_games: list,
) -> pl.DataFrame:
    """
    Function to calculate the percentage of channels where the game is the main game.

    Parameters:
    - game_counts_per_channel (pl.DataFrame): DataFrame containing the count of videos per game.
    - main_game_per_channel (pl.DataFrame): DataFrame containing the main game per channel.
    - target_games (list): List of target games to consider.

    Returns:
    - pl.DataFrame: A DataFrame containing the percentage of channels where the game is the main game.
    """
    # Filter and aggregate channels having at least one video for each target game
    channels_with_game = (
        game_counts_per_channel.filter(pl.col("video_game").is_in(target_games))
        .group_by("video_game")
        .agg(pl.n_unique("channel_id").alias("channels_with_at_least_one_vid"))
    )

    # Filter and aggregate channels where the game is the main game for each target game
    main_game_counts = (
        main_game_per_channel.filter(pl.col("top_game").is_in(target_games))
        .group_by("top_game")
        .agg(pl.n_unique("channel_id").alias("channels_with_main_game"))
    )

    # Join the two DataFrames on the game name and calculate the percentage
    result = channels_with_game.join(
        main_game_counts, left_on="video_game", right_on="top_game", how="left"
    ).with_columns(
        (
            pl.col("channels_with_main_game").fill_null(0)
            / pl.col("channels_with_at_least_one_vid")
            * 100
        )
        .round(2)
        .alias("percentage")
    )

    return result


def calculate_like_dislikes_ratio(
    with_game_df: pl.DataFrame, top_games_df: pl.DataFrame, top_n: int = 3
) -> pl.DataFrame:
    """
    Function to calculate the like/dislike ratio for the top N games.

    Parameters:
    - with_game_df (pl.DataFrame): DataFrame containing game data with 'video_game', 'like_count', and 'dislike_count'.
    - top_games_df (pl.DataFrame): DataFrame containing a list of top games.
    - top_n (int): Number of top games to consider. Default is 3.

    Returns:
    - pl.DataFrame: A DataFrame containing the like/dislike ratio for the top N games.
    """
    # Filter the dataframe for the top N games and calculate the likes/dislikes ratio for each game
    like_dislikes_ratio_df = (
        with_game_df.filter(
            pl.col("video_game").is_in(top_games_df["top_game"].head(top_n))
        )  # Filter the top games
        .group_by("video_game")  # Group by video_game
        .agg(
            [  # Aggregate the like and dislike counts
                (pl.col("like_count").sum() / pl.col("dislike_count").sum())
                .alias("like_dislike_ratio")
                .round(2)
            ]
        )
    )

    return like_dislikes_ratio_df

def calculate_posting_rate(df: pl.DataFrame) -> pl.DataFrame:
    """
    Calculate the posting rate (percentage of videos per game) in the given DataFrame.

    Args:
        df (pl.DataFrame): DataFrame with a 'video_game' column representing the game each video is associated with.

    Returns:
        pl.DataFrame: A DataFrame showing each game and its posting rate percentage.
    """
    # Count the number of videos per game
    game_counts = df.group_by("video_game").agg(pl.count().alias("video_count"))
    
    # Calculate the total number of videos
    total_videos = df.height
    
    # Calculate the posting rate as a percentage
    posting_rate = game_counts.with_columns(
        (pl.col("video_count").cast(pl.Float64) / total_videos * 100).alias("posting_rate")
    )
    
    # Round the posting_rate to two decimal places
    posting_rate = posting_rate.with_columns(
        pl.col("posting_rate").round(2)
    )
    
    posting_rate = posting_rate.sort("posting_rate", descending=True)

    return posting_rate

