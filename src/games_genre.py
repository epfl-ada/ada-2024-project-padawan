import polars as pl
import pandas as pd
import numpy as np


def join_games_with_genres(games_df, with_game_df):
    """
    Converts games_df to a Polars DataFrame, lowercases the 'Title' column, and joins it with with_game_df.
    
    Args:
        games_df (pd.DataFrame): DataFrame containing video game titles and genres.
        with_game_df (pd.DataFrame): DataFrame containing a 'video_game' column to match against titles.
    
    Returns:
        pl.DataFrame: A Polars DataFrame with the genres joined and rows with null 'Genres' dropped.
    """
    # Convert games_df to a Polars DataFrame
    games_df_pl = pl.from_pandas(games_df)

    # Lowercase the titles in games_df
    games_df_lower = games_df_pl.with_columns(pl.col("Title").str.to_lowercase())

    # Perform the join on the lowercased 'Title' and 'video_game' columns
    merged_df = with_game_df.join(
        games_df_lower.select(["Title", "Genres"]),
        left_on="video_game",
        right_on="Title",
        how="left",
    ).drop_nulls(subset=["Genres"])

    return merged_df

def count_genre_occurrences(merged_df):
    """
    Explodes the 'Genres' column in merged_df and counts the occurrences of each genre.

    Args:
        merged_df (pl.DataFrame): Polars DataFrame with a 'Genres' column containing comma-separated genres.

    Returns:
        pl.DataFrame: A Polars DataFrame with the genres and their corresponding counts, sorted in descending order.
    """
    # Explode the 'Genres' column after splitting by commas
    exploded_genres_df = (
        merged_df.with_columns(pl.col("Genres").str.split(","))
        .explode("Genres")
        .with_columns(pl.col("Genres").str.strip_chars("[]' ").alias("Genres"))
    )

    # Group by the 'Genres' column, count the occurrences, and sort in descending order
    genre_counts = (
        exploded_genres_df.group_by("Genres").count().sort("count", descending=True)
    )

    return exploded_genres_df, genre_counts

def get_monthly_counts_by_top_genres(exploded_genres_df, genre_counts):
    """
    Filters the top 5 genres and counts their occurrences per month in the exploded_genres_df.

    Args:
        exploded_genres_df (pl.DataFrame): A Polars DataFrame with 'Genres' and 'upload_date' columns.
        genre_counts (pl.DataFrame): A Polars DataFrame with 'Genres' and 'count' columns.

    Returns:
        pl.DataFrame: A Polars DataFrame with the monthly counts of each top genre.
    """
    # Get the top 5 genres
    top_genres = genre_counts.head(5).get_column("Genres").to_list()

    # Round the 'upload_date' to the first day of the month
    clean_upload_dates_df = exploded_genres_df.with_columns(
        pl.col("upload_date").str.to_date(format="%Y-%m-%d %H:%M:%S")
    ).with_columns(
        pl.col("upload_date").dt.month_start()
    )

    # Filter for top genres and count occurrences per month
    monthly_counts_by_genre = (
        clean_upload_dates_df
        .filter(pl.col("Genres").is_in(top_genres))
        .group_by(["upload_date", "Genres"])
        .agg(pl.count().alias("count"))
        .sort(["upload_date", "Genres"])
    )

    return monthly_counts_by_genre

def create_genre_cooccurrence_matrix(merged_df):
    """
    Creates a genre co-occurrence matrix from a Polars DataFrame containing video games and their genres.

    Args:
        merged_df (pl.DataFrame): Polars DataFrame with 'video_game' and 'Genres' columns.

    Returns:
        pd.DataFrame: A genre co-occurrence matrix.
    """
    # Deduplicate by keeping one appearance of each video game
    merged_df_unique = (
        merged_df.unique(subset=["video_game"])
        .with_columns(pl.col("Genres").str.split(","))
        .explode("Genres")
        .with_columns(pl.col("Genres").str.strip_chars("[]' ").alias("Genres"))
    )

    # Convert to pandas for creating the binary matrix
    merged_df_unique_pd = merged_df_unique.to_pandas()

    # Create a binary matrix (one-hot encoding of genres for each video game)
    binary_matrix = pd.crosstab(
        merged_df_unique_pd["video_game"], merged_df_unique_pd["Genres"]
    )

    # Create the co-occurrence matrix
    co_occurrence_matrix = binary_matrix.T.dot(binary_matrix)

    # Remove self co-occurrences by setting the diagonal to zero
    np.fill_diagonal(co_occurrence_matrix.values, 0)

    return co_occurrence_matrix


