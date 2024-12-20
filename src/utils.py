"""This file contains useful fuctions for the main notebook."""

import pandas as pd
import polars as pl
import matplotlib.pyplot as plt
import string


def segment_channel(df: pd.DataFrame, lower_bound: int, upper_bound: float, column: str) -> pd.DataFrame:
    """
    Segment the channels based on the number of subscribers.
    
    Args:
        df: pd.DataFrame - channels dataframe to segment
        lower_bound: int - lower bound of the segment
        upper_bound: float - upper bound of the segment
        column: str - column to segment
        
    Returns:
        pd.DataFrame - the segmented dataframe
    """
    return df[(df[column] >= lower_bound) & (df[column] < upper_bound)]


def preprocess_name(name: str) -> str:
    """
    Convert to lowercase and remove punctuation from the name.
    
    Args:
        name: str - name of the game
    
    Returns:
        str - processed name
    """
    return name.lower().replace(",", " ").translate(str.maketrans('', '', string.punctuation))


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


def cluster_timeseries(
    timeseries_df: pl.DataFrame,
    metrics: str = "subs"
) -> pl.DataFrame:
    """
    Assign a cluster number to each channel based on the number of views/subscribers.
    
    Args:
        timeseries_df: pl.DataFrame - timeseries with the views/subs for all channels
        metrics: str - metric to use for clustering, either "subs" or "views"
    
    Returns:
        pl.DataFrame - dataframe with the cluster number for each channel
    """
    clusters_df = timeseries_df.clone()
    subs_df = clusters_df.unique('channel_id', keep='last').select(['channel_id', 'subs', 'views'])
    clusters_df = clusters_df.join(subs_df, on='channel_id', suffix='_last')
    match metrics:
        case "subs":
            bins = [20_000, 50_000, 100_000, 500_000]
            clusters_df = clusters_df.with_columns(
                pl.col("subs_last").cut(breaks=bins, labels=["1", "2", "3", "4", "5"]).alias("cluster")
            )
        case "views":
            bins = [200_000, 1_000_000, 10_000_000, 100_000_000]
            clusters_df = clusters_df.with_columns(
                pl.col("views_last").cut(breaks=bins, labels=["1", "2", "3", "4", "5"]).alias("cluster")
            )

    return clusters_df.drop('subs_last', 'views_last')


def get_stats_per_date(
    timeseries_df: pl.DataFrame,
    metrics: str = "delta_views",
    agg_func: str = "sum"
) -> pl.DataFrame:
    """
    Compute the sum/mean of views/subs of all channels at the same date.

    Args:
        df: pl.DataFrame - time series with the views/subs of all channels
        metrics: str - metric to sum, either "delta_views" or "delta_subs"
        agg_func: str - aggregation function to use for the sum, either "sum" or "mean"

    Returns:
        pl.DataFrame - dataframe with the sum of views/subs for each date
    """
    stats_df = timeseries_df.with_columns(
        pl.col("datetime").str.to_date(format="%Y-%m-%d %H:%M:%S"),
    )
    return (
         stats_df
            .filter(pl.col("datetime").is_not_null() & pl.col(metrics).is_not_null())
            .with_columns([
                pl.col(metrics).round().cast(pl.Int64)
            ])
            .group_by("datetime")
            .agg(pl.col(metrics).sum() if agg_func == "sum" else pl.col(metrics).mean())
    )
    
    
def plot_clusters(
    timeseries_df: pl.DataFrame,
    channels_top_game_df: pl.DataFrame,
    esports_df: pd.DataFrame,
    game_name: str,
    window_size: int = 6,
    get_stats_per_date: callable = get_stats_per_date,
    agg_func: str = "sum",
    metrics: str = 'delta_views',
) -> None:
    """
    Plot the weekly statistics for the channels of a specific game, clustered by the number of views 
    or subscribers (mean or sum), as well as the main esports tournaments date for that game.

    Args:
        timeseries_df: pl.DataFrame - timeseries with the views/subs for all channels
        channels_top_game_df: pl.DataFrame - dataframe with the top game for each channel
        esports_df: pd.DataFrame - dataframe with esports tournaments
        game_name: str - name of the game
        window_size: int - size of the window for the rolling average
        get_stats_per_date: callable - function to apply to the timeseries data per date"
        agg_func: str - aggregation function to use for the sum, either "sum" or "mean"
        metrics: str - metric to sum, either "delta_views" or "delta_subs"
    """
    
    game_channels_s = channels_top_game_df.filter(pl.col("top_game") == game_name).get_column("channel_id")
    game_timeseries_df = cluster_timeseries(
        timeseries_df.filter(pl.col("channel_id").is_in(game_channels_s), "subs" if metrics == "delta_subs" else "views")
    )

    num_clusters = game_timeseries_df.get_column("cluster").n_unique()
    tournament_dates = esports_df[esports_df["video_game"] == game_name][
        ["start_date", "end_date"]
    ]
    tournament_dates = list(zip(tournament_dates["start_date"].dt.strftime("%Y-%m-%d"), tournament_dates["end_date"].dt.strftime("%Y-%m-%d")))
    _, axs = plt.subplots(num_clusters, 1, figsize=(15, 5 * num_clusters))

    for cluster in range(1, num_clusters + 1):
        
        cluster_df = game_timeseries_df.filter(game_timeseries_df.get_column("cluster").cast(pl.Int64) == cluster)
        cluster_df = get_stats_per_date(cluster_df, metrics=metrics)
        
        weekly_df = cluster_df.group_by("datetime").agg(pl.col(metrics).mean()).sort("datetime")
        weekly_df = weekly_df.with_columns(
            pl.col(metrics).rolling_mean(window_size).alias("rolling_average")
        )

        ax = axs[cluster - 1]
        ax.plot(weekly_df["datetime"], weekly_df["rolling_average"], marker="o")

        for start, end in tournament_dates:
            ax.axvspan(
                start, end, color="green", alpha=0.2, label="Tournament"
            )

        ax.set_title(
            f"Weekly {agg_func} of {metrics} for {game_name} channels (cluster n°{cluster})"
        )
        ax.set_xlabel("Date")
        ax.set_ylabel(metrics)
        ax.grid(True)