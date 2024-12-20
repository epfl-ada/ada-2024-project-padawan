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


def plot_metric(
    df: pd.DataFrame,
    game_names: list[str],
    channel: bool = True,
    dates: list[tuple[str, str]] = None,
    metric: str = "views",
    period: str = "W",
    window: int = 4,
) -> None:
    """
    Plots the weekly views for a list of sepcified games as well as events that occurred during the period.

    Args:
        df (pd.DataFrame): The DataFrame containing the time series data for the games.
        game_names (list[str]): The list of games whioch views we want to display.
        channel (bool): Whether to plot views for individual channels. Default is True.
        dates (list[tuple[str, str]]): A list of tuples containing the event name and date.
        period (str): The period to group the data by. Default is 'W' (weekly).
        window (int): The window size for the rolling average. Default is 4.
    """
    # Create the plot
    fig = go.Figure()
    min = float("inf")
    max = 0
    for game_name in game_names:
        if channel:
            metrics = generate_metric_for_channels(
                games_timeseries_df=df,
                game_name=game_name,
                period=period,
                window=window,
                metric=metric,
            )
            x = metrics["period"]
            y = metrics["view_count"]
            if y.min() < min:
                min = y.min()
            if y.max() > max:
                max = y.max()
            label = f"{game_name.capitalize()} - {metric}"
        else:
            metrics = generate_views_for_game(df, game_name, period, window)
            x = metrics.index
            y = metrics["view_count"]
            if y.min() < min:
                min = y.min()
            if y.max() > max:
                max = y.max()
            label = f"{game_name} - {metric}"

        # Add line plot for views
        fig.add_trace(
            go.Scatter(x=x, y=y, mode="lines", name=label, line=dict(width=2))
        )

    # Add vertical lines for the specified dates
    if dates:
        stagger_offset = 0  # Counter for staggering
        for i, (event_name, date) in enumerate(dates):
            event_date = pd.to_datetime(date)
            fig.add_trace(
                go.Scatter(
                    x=[event_date, event_date],
                    y=[min, max],
                    mode="lines",
                    name=event_name,
                    line=dict(color="red", dash="dash"),
                    showlegend=False,
                )
            )
            # Adjust the y-position for event name annotation
            staggered_y = max + (i % 2) * (max - min) * 0.05  # Alternate y-offset
            fig.add_trace(
                go.Scatter(
                    x=[event_date],
                    y=[staggered_y],
                    text=[event_name],
                    mode="text",
                    textposition="top center",
                    showlegend=False,
                )
            )

    if channel:
        title = f"{metric.capitalize()} Generated by {', '.join([name.title() for name in game_names])} channels"
    else:
        title = f"{', '.join([name.title() for name in game_names])} Videos {metric.capitalize()}"

    # Customize the layout
    fig.update_layout(
        title=title,
        xaxis_title="Month",
        yaxis_title=metric.capitalize(),
        xaxis=dict(tickangle=45, showgrid=False),  # Disable gridlines for x-axis
        yaxis=dict(showgrid=True),  # Enable gridlines for y-axis
        template="plotly_white",
    )

    # Show the plot
    fig.show()


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


# --------------------------------------------- Exporting to JSON ---------------------------------------------

def export_views_top_games_json(
    df: pl.DataFrame,
    game_names: str,
    period: str = "W",
    window: int = 3,
    output_file="weekly_delta_views.json",
):
    """
    Exports a JSON file containing delta_views for each week for the top 15 games and the corresponding time axis.

    Args:
        channels_top_game_df (pl.DataFrame): DataFrame with 'channel_id' and 'top_game' columns.
        timeseries_df (pl.DataFrame): The timeseries DataFrame with a 'channel_id' column and datetime data.
        games (list[str]): List of game names to filter and export.
        cutoff (str): The date to use as a left cutoff for the data (format: "YYYY-MM-DD").
        output_file (str): Name of the JSON file to export.

    Returns:
        None
    """
    result = {"weeks": None}  
    # Loop through each game and collect delta_views
    for game_name in game_names:
        metric = generate_views_for_game(
            df=df,
            game_name=game_name,
            period=period,
            window=window,
            
        )
        result[game_name] = metric["view_count"].astype(int).tolist()
        result["weeks"] = metric.index.astype(str).tolist()
    # Export to JSON
    with open(output_file, "w") as f:
        json.dump(result, f, indent=4)


def metric_to_json(
    df: pd.DataFrame,
    game_names: list[str],
    channel_views: bool = True,
    dates: dict[str, list[tuple[str, str]]] = None,
    period: str = "W",
    window: int = 4,
    metric: str = "views",
    output_file: str = "games_metrics.json",
    lower_cutoff: str = None,
) -> None:
    """
    Export game metric data and event dates into a JSON format compatible with charting libraries.

    Args:
        df (pd.DataFrame): DataFrame containing game time series data.
        game_names (list[str]): List of game names to process.
        channel_views (bool): Whether to generate metrics for individual channels. Default is True.
        dates (dict[str, list[tuple[str, str]]]): Dictionary with game names as keys and event tuples (event_name, date) as values.
        period (str): Grouping period for time series. Default is 'W' (weekly).
        window (int): Rolling average window size. Default is 4.
        metric (str): The metric to plot. Default is 'views'.
        output_file (str): Output JSON file path. Default is 'games_metrics.json'.
    """
    series_data = []
    all_x_axis_data = []

    # Collect X-axis data and align them
    x_axis_offsets = {}
    for game_name in game_names:
        if channel_views:
            views = generate_metric_for_channels(
                games_timeseries_df=df,
                game_name=game_name,
                period=period,
                window=window,
                metric=metric,
                lower_cutoff=lower_cutoff
            )
            x_axis_data = views["period"].dt.strftime("%Y-%m-%d").tolist()
        else:
            views = generate_views_for_game(df, game_name, period, window, lower_cutoff)
            x_axis_data = views.index.strftime("%Y-%m-%d").tolist()

        all_x_axis_data.append(x_axis_data)
        y_axis_data = views["view_count"].fillna(0).tolist()

        # Save the series data temporarily
        series_data.append((game_name, x_axis_data, y_axis_data))

    # Find the earliest start date
    earliest_date = min(min(pd.to_datetime(axis)) for axis in all_x_axis_data)

    # Calculate offsets and adjust data
    final_x_axis = pd.date_range(
        start=earliest_date,
        end=max(max(pd.to_datetime(axis)) for axis in all_x_axis_data),
        freq=period,
    ).strftime("%Y-%m-%d").tolist()

    aligned_series_data = []
    for game_name, x_axis_data, y_axis_data in series_data:
        offset = (pd.to_datetime(x_axis_data[0]) - earliest_date).days // 7  # Offset in weeks
        aligned_y_axis = [0] * offset + y_axis_data
        aligned_y_axis += [0] * (len(final_x_axis) - len(aligned_y_axis))
        aligned_series_data.append(
            {
                "name": game_name,
                "type": "line",
                "data": aligned_y_axis,
            }
        )

    # Add markArea data if event dates are provided
    mark_area_data = {}
    if dates:
        data = []
        for event_name, date in dates:
            event_date = pd.to_datetime(date)
            start_date = min(
                final_x_axis,
                key=lambda d: abs(
                    pd.Timestamp(d) - (event_date - pd.Timedelta(weeks=1))
                ),
            )
            end_date = min(
                final_x_axis,
                key=lambda d: abs(
                    pd.Timestamp(d) - (event_date + pd.Timedelta(weeks=1))
                ),
            )
            data.append(
                [
                    {"name": f"{event_name} Start", "xAxis": start_date},
                    {"name": f"{event_name} End", "xAxis": end_date},
                ]
            )
        mark_area_data["data"] = data

    mark_area_data["itemStyle"] = {"color": "rgba(255, 173, 177, 0.4)"}

    # Assign the markArea data to each series
    for series in aligned_series_data:
        series["markArea"] = mark_area_data

    # Prepare the final JSON structure
    chart_json = {
        "title": {"text": f"{metric.capitalize()} Over Time of {', '.join([name.title() for name in game_names])}"},
        "xAxis": {"data": final_x_axis},
        "series": aligned_series_data,
    }

    # Write to the output file
    with open(output_file, "w") as f:
        json.dump(chart_json, f, indent=4)
