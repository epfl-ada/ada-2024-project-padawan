import pandas as pd
import polars as pl
import matplotlib.pyplot as plt
import json
import plotly.graph_objects as go


def games_timeseries(channels_top_game_df: pl.DataFrame, timeseries_df: pl.DataFrame):
    """
    Compute the time series of views, subs and videos for each top game.
    Args:
        channels_top_game_df (pl.DataFrame): Polars DataFrame with columns channel_id and top_game.
        timeseries_df (pl.DataFrame): Polars DataFrame with columns channel_id, datetime, views, subs, videos.
    """
    merged_df = channels_top_game_df.join(timeseries_df, on="channel_id", how="inner")
    games_timeseries_df = (
        merged_df.group_by(["top_game", "datetime"])
        .agg(
            [
                pl.sum("views").alias("views"),
                pl.sum("delta_views").alias("delta_views"),
                pl.sum("subs").alias("subs"),
                pl.sum("delta_subs").alias("delta_subs"),
                pl.sum("videos").alias("videos"),
                pl.sum("delta_videos").alias("delta_videos"),
            ]
        )
        .sort(["top_game", "datetime"])
    )
    return games_timeseries_df


def generate_metric_for_channels(
    games_timeseries_df: pd.DataFrame,
    game_name: str,
    metric: str = "views",
    period: str = "W",
    window: int = 4,
    lower_cutoff: str = None,
) -> pd.DataFrame:
    """ "
    Generates a time series DataFrame for a specfied metric of a specified game.
        Args:
            games_timeseries_df (pd.DataFrame): The DataFrame containing the time series data for the games.
            game_name (str): The name of the game to plot.
            dates (list[tuple[str, str]]): A list of tuples containing the event name and date.
            period (str): The period to group the data by. Default is 'W' (weekly).
            window (int): The window size for the rolling average. Default is 4.
            metric (str): The metric to plot. Default is 'views'.
        Returns:
            game_period (pd.DataFrame): The time series DataFrame for the views of the specified game.
    """

    column_name = (
        "delta_views"
        if metric == "views"
        else "delta_subs" if metric == "subs" else "delta_videos"
    )

    game_df = games_timeseries_df.filter(pl.col("top_game") == game_name).to_pandas()
    game_df["datetime"] = pd.to_datetime(game_df["datetime"])
    game_df["period"] = game_df["datetime"].dt.to_period(period)

    # Aggregate views by
    game_period = game_df.groupby("period").agg({column_name: "sum"}).reset_index()
    game_period["period"] = game_period["period"].dt.to_timestamp()

    if lower_cutoff:
        game_period = game_period[game_period["period"] >= pd.Timestamp(lower_cutoff)]

    game_period["view_count"] = (
        game_period[column_name].rolling(window=window, center=False).mean()
    )

    return pd.DataFrame(game_period)


def generate_views_for_game(
    df: pl.DataFrame, game_name: str, period: str = "W", window: int = 3, lower_cutoff: str = None
) -> pd.DataFrame:
    """
    Generate weekly aggregated view counts for a given video game.
    Args:
        df (pl.DataFrame): Polars DataFrame with columns 'upload_date', 'view_count', 'video_game'.
        game_name (str): Name of the video game to filter on.
        period (str): Period to resample the data. Default is 'W' (weekly).
    Returns:
        weekly_views (pd.DataFrame): Weekly aggregated view counts for the specified game.
    """

    game_df = df.filter(pl.col("video_game") == game_name).to_pandas()
    game_df["upload_date"] = pd.to_datetime(game_df["upload_date"])

    weekly_views = (
        game_df.set_index("upload_date")
        .resample(period)  # Resample to weekly frequency
        .sum(numeric_only=True)["view_count"]  # Sum views per week
    )
    averaged_weekly_views = weekly_views.rolling(window=window, min_periods=1).mean()

    if lower_cutoff:
        averaged_weekly_views = averaged_weekly_views[averaged_weekly_views.index >= pd.Timestamp(lower_cutoff)]
    return pd.DataFrame(averaged_weekly_views)




def game_percentage(df: pl.DataFrame, channels: bool = False):
    """
    Returns the percentage of videos games associated with channels or videos
    Args:
        df(pl.DataFrame): videos or channels dataframe
        channels(bool): whether the dataframe is channels or videos
    Returns:
        with_game_counts(pl.DataFrame): the percentage of videos games associated with channels or videos
    """

    column_name = "top_game" if channels else "video_game"
    with_game_counts = (
        df.get_column(column_name)
        .value_counts()
        .sort("count", descending=True)
        .head(10)
    )
    with_game_counts = with_game_counts.with_columns(
        (100 * pl.col("count") / len(df)).alias("percentage")
    )

    with_game_counts = with_game_counts.with_columns(
        pl.col("percentage").round(2)
    ).drop("count")
    return with_game_counts


