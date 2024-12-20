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


def generate_views_for_channels(
    games_timeseries_df: pd.DataFrame,
    game_name: str,
    period: str = "W",
    window: int = 4,
) -> pd.DataFrame:
    """ "
    Generates a time series DataFrame for periodic generaetd views of a specified game.
        Args:
            games_timeseries_df (pd.DataFrame): The DataFrame containing the time series data for the games.
            game_name (str): The name of the game to plot.
            dates (list[tuple[str, str]]): A list of tuples containing the event name and date.
            period (str): The period to group the data by. Default is 'W' (weekly).
            window (int): The window size for the rolling average. Default is 4.
        Returns:
            game_period (pd.DataFrame): The time series DataFrame for the views of the specified game.
    """

    game_df = games_timeseries_df.filter(pl.col("top_game") == game_name).to_pandas()
    game_df["datetime"] = pd.to_datetime(game_df["datetime"])
    game_df["period"] = game_df["datetime"].dt.to_period(period)

    # Aggregate views by
    game_period = game_df.groupby("period").agg({"delta_views": "sum"}).reset_index()
    game_period["period"] = game_period["period"].dt.to_timestamp()

    # Filter for dates starting from 2016-10-01
    game_period = game_period[game_period["period"] >= pd.Timestamp("2016-10-01")]

    game_period["view_count"] = (
        game_period["delta_views"].rolling(window=window, center=False).mean()
    )

    return pd.DataFrame(game_period)


def generate_views_for_game(
    df: pl.DataFrame, game_name: str, period: str = "W", window: int = 3
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
    return pd.DataFrame(averaged_weekly_views)


# --------------------------------------------- Exporting to JSON ---------------------------------------------


def views_to_json(
    df: pd.DataFrame,
    game_name: str,
    channel_views: bool = True,
    dates: list[tuple[str, str]] = None,
    period: str = "W",
    window: int = 4,
    output_file: str = "game_views.json",
) -> None:
    """
    Export game views data and event dates into a JSON format compatible with charting libraries.

    Args:
        games_timeseries_df (pd.DataFrame): DataFrame containing game time series data.
        game_name (str): Name of the game to process.
        dates (list[tuple[str, str]]): List of event tuples (event_name, date).
        period (str): Grouping period for time series. Default is 'W' (weekly).
        window (int): Rolling average window size. Default is 4.
        output_file (str): Output JSON file path. Default is 'game_views.json'.
    """
    if channel_views:
        views = generate_views_for_channels(df, game_name, period, window)
        x_axis_data = views["period"].dt.strftime("%Y-%m-%d").tolist()

    else:
        views = generate_views_for_game(df, game_name, period, window)
        x_axis_data = views.index.strftime("%Y-%m-%d").tolist()

    y_axis_data = views["view_count"].fillna(0).tolist()

    # Transform event dates into individual markArea data for highlighting regions
    mark_area_data = []
    if dates:
        for event_name, date in dates:
            event_date = pd.to_datetime(date)
            start_date = min(
                x_axis_data, key=lambda d: abs(pd.Timestamp(d) - (event_date - pd.Timedelta(weeks=1))))

            end_date = min(
                x_axis_data, key=lambda d: abs(pd.Timestamp(d) - (event_date + pd.Timedelta(weeks=1))))

            
            mark_area_data.append(
                [
                    {"name": f"{event_name} Start", "xAxis": start_date},
                    {"name": f"{event_name} End", "xAxis": end_date},
                ]
            )

    # Construct json
    chart_json = json_format_views(game_name, x_axis_data, y_axis_data, mark_area_data)

    with open(output_file, "w") as f:
        json.dump(chart_json, f, indent=4)


def json_format_views(
    game_name: str,
    x_axis_data: list[str],
    y_axis_data: list[int],
    mark_area_data: list[list[str]],
) -> dict:
    """ "
    Formats the data for a line chart in JSON format.
        Args:
            game_name (str): The name of the game.
            x_axis_data (list[str]): The x-axis data.
            y_axis_data (list[int]): The y-axis data.
            mark_area_data (list[list[str]]): The mark area data.
        Returns:
            chart_json (dict): The JSON formatted data for the line chart
    """
    chart_json = {
        "title": {
            "text": f"Views Generated by {game_name}",
        },
        "xAxis": {"data": x_axis_data},
        "yAxis": {},
        "series": [
            {
                "type": "line",
                "data": y_axis_data,
                "markArea": {
                    "itemStyle": {"color": "rgba(255, 173, 177, 0.4)"},
                    "data": mark_area_data,
                },
            }
        ],
    }
    return chart_json
