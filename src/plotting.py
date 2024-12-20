import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import random
import matplotlib.colors as mcolors
import polars as pl
import plotly.graph_objects as go
import networkx as nx

from src.timeseries import generate_metric_for_channels, generate_views_for_game
from wordcloud import WordCloud, STOPWORDS

def plot_category_pie_chart(pie_values_df):
    # Extract categories and values
    categories = pie_values_df.index.tolist()
    values = pie_values_df['value'].tolist()

    # Generate colors for the pie chart
    colors = sns.color_palette('hls', n_colors=len(categories))

    # Create the final pie chart data DataFrame
    pie_chart_data_df = pd.DataFrame({
        'id': categories,
        'label': categories,
        'value': values,
        'color': colors
    })

    # Plot the pie chart
    plt.figure(figsize=(6, 6))

    plt.pie(
        pie_chart_data_df['value'],
        labels=pie_chart_data_df['label'],
        colors=pie_chart_data_df['color'],
        autopct='%1.1f%%',
        startangle=30
    )

    plt.title("Distribution of Video Categories")
    plt.show()

def plot_video_duration_histogram(videos_sample_df):
    # Plot the histogram
    plt.hist(
        videos_sample_df['duration'],
        bins=150,
        range=(0, videos_sample_df['duration'].quantile(0.95)),
        color='skyblue',
        edgecolor='black'
    )
    
    # Add a red vertical line just left of the 600 seconds threshold
    plt.axvline(x=580, color='red', linestyle='--', linewidth=2, label='Unlimited ads threshold (600 seconds)')
    
    # Label the axes and title
    plt.xlabel('Video duration (seconds)')
    plt.ylabel('Number of videos')
    plt.title('Distribution of Video Duration')
    
    # Add the legend
    plt.legend()
    
    # Display the plot
    plt.show()

def generate_tag_wordcloud(tags):
    """
    Generates and displays a word cloud from the given tag frequencies.

    Args:
        tags (pl.DataFrame): A Polars DataFrame with 'tags' and 'count' columns.
    """
    # Convert the Polars DataFrame to a dictionary of tag frequencies
    tag_frequencies = tags.to_pandas().set_index("tags")["count"].to_dict()
    
    # Create a word cloud
    wordcloud = WordCloud(
        width=800,
        height=800,
        background_color="white",
        stopwords=STOPWORDS,
        min_font_size=10
    ).generate_from_frequencies(tag_frequencies)
    
    # Display the word cloud
    plt.figure(figsize=(8, 8), facecolor=None)
    plt.imshow(wordcloud)
    plt.axis("off")
    plt.title("Tag Word Cloud")
    plt.show()

    return tag_frequencies

def plot_weekly_timeseries(
    ax: plt.Axes,
    df: pd.DataFrame, 
    metrics: list[str], 
    cutoff: str,
    game: str,
    yscale: str = "linear",
) -> None:
    """
    Plot a weekly time series with customized color and thickness for views/subs.

    Args:
        ax (plt.Axes): The matplotlib axes to plot on.
        df (pd.DataFrame): The timeseries data to plot, with a datetime column and metrics columns.
        metrics (list[str]): The metrics to plot, as column names in df.
        cutoff (str): The date to use as a left cutoff for the plot (format: "YYYY-MM-DD").
        title (str): The title of the plot.
        game (str): The name of the game, used to assign color.
        yscale (str): The scale of the y-axis, either "linear" or "log".
        game_colors (dict): A dictionary of game names and their respective colors.
        line_thickness (dict): A dictionary for controlling the thickness of lines for views and subs.
    """
    assert all([metric in df.columns for metric in metrics])
    
    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df[df["datetime"] >= pd.to_datetime(cutoff)]
    df["week"] = df["datetime"].dt.to_period("W")
    df = (
        df.groupby("week").agg({f"{metric}": "sum" for metric in metrics}).reset_index()
    )
    df["week"] = df["week"].dt.to_timestamp()
    
    color = mcolors.to_hex([random.random(), random.random(), random.random()])
    for i, metric in enumerate(metrics):
        ax.plot(
            df["week"],
            df[metric].rolling(window=4, center=False).mean(),
            label=f"{game} - {metric}",
            color=color,
            linewidth=i + 2,
        )

    ax.set_xlabel("Date")
    ax.set_ylabel("Count")
    ax.set_yscale(yscale)
    ax.legend()


def plot_top_game_timeseries(channels_top_game_df, timeseries_df, games, metrics, cutoff="2017-01-01", yscale="log"):
    """
    Filters the timeseries data for specific top games and plots weekly timeseries for each.

    Args:
        channels_top_game_df (pl.DataFrame): DataFrame with 'channel_id' and 'top_game' columns.
        timeseries_df (pl.DataFrame): The timeseries DataFrame with a 'channel_id' column and datetime data.
        games (list[str]): List of game names to filter and plot.
        metrics (list[str]): List of metrics to plot, e.g., ['delta_views', 'delta_subs'].
        cutoff (str): The date to use as a left cutoff for the plot (format: "YYYY-MM-DD").
        yscale (str): The scale of the y-axis, either "linear" or "log".

    Returns:
        None: The function plots the data directly.
    """
    fig, ax = plt.subplots(figsize=(12, 6))

    for game in games:
        # Filter channels associated with the current game
        game_channels = channels_top_game_df.filter(pl.col("top_game") == game).to_pandas()["channel_id"]
        
        # Filter timeseries data for those channels
        game_df = timeseries_df.to_pandas().query("channel_id in @game_channels").reset_index(drop=True)
        
        # Plot the timeseries data
        plot_weekly_timeseries(
            ax,
            game_df,
            metrics=metrics,
            cutoff=cutoff,
            yscale=yscale,
            game=game,
        )

    plt.show()

def plot_genre_counts(genre_counts_df):
    """
    Plots a bar chart of genre counts from a pandas DataFrame.

    Args:
        genre_counts_df (pd.DataFrame): DataFrame with 'Genres' and 'count' columns.
    """
    # Plot the bar chart
    plt.figure(figsize=(10, 6))
    plt.bar(genre_counts_df["Genres"], genre_counts_df["count"], color="skyblue")
    plt.xlabel("Genres")
    plt.ylabel("Count")
    plt.title("Genre Counts")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.show()

def plot_monthly_counts_by_genre(monthly_counts_by_genre):
    """
    Converts a Polars DataFrame to pandas and plots a line chart of genre counts over time.

    Args:
        monthly_counts_by_genre (pl.DataFrame): A Polars DataFrame with 'upload_date', 'Genres', and 'count' columns.
    """
    # Convert to pandas DataFrame for plotting
    monthly_counts_by_genre_pd = monthly_counts_by_genre.to_pandas()

    # Create the plot
    plt.figure(figsize=(12, 6))
    sns.lineplot(
        data=monthly_counts_by_genre_pd,
        x="upload_date",
        y="count",
        hue="Genres",
        palette="tab10",
    )

    # Set plot limits and labels
    plt.xlim(right=pd.Timestamp("2019-08-31"))
    plt.xlabel("Upload date")
    plt.ylabel("Number of videos")
    plt.title("Distribution of Upload Dates by Genre")
    plt.xticks(rotation=45)
    plt.legend(title="Genre")
    plt.tight_layout()

    # Display the plot
    plt.show()

def plot_genre_cooccurrence_heatmap(co_occurrence_matrix):
    """
    Plots a heatmap of the genre co-occurrence matrix.

    Args:
        co_occurrence_matrix (pd.DataFrame): The genre co-occurrence matrix.
    """
    # Plot the heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(co_occurrence_matrix, cmap="Blues", annot=True, fmt="d")
    plt.title("Genre Co-Occurrence Matrix")
    plt.xlabel("Genres")
    plt.ylabel("Genres")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.show()

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


def plot_markov_matrix(filtered_weights_df: pd.DataFrame) -> None:
    """
    Create and plot a Markov transition matrix from a DataFrame of game weights.

    Args:
        filtered_weights_df (pd.DataFrame): DataFrame containing 'game1', 'game2', and 'weight' columns.
            'game1' and 'game2' are game names, and 'weight' represents the interaction strength.
    
    Returns:
        None: Displays a heatmap of the Markov transition matrix.
    """
    
    # Capitalize game names
    filtered_weights_df['game1'] = filtered_weights_df['game1'].str.title()
    filtered_weights_df['game2'] = filtered_weights_df['game2'].str.title()

    # Calculate row sums
    row_sums = filtered_weights_df.groupby('game1')['weight'].sum()

    # Calculate the probability of each transition
    filtered_weights_df['probability'] = filtered_weights_df.apply(
        lambda row: row['weight'] / row_sums[row['game1']], axis=1
    )

    # Create the Markov transition matrix
    markov_matrix = filtered_weights_df.pivot_table(
        index='game1', columns='game2', values='probability', fill_value=0
    )

    # Plot the heatmap
    plt.figure(figsize=(10, 8))
    sns.heatmap(markov_matrix, cmap='Blues', annot=False, fmt=".2f", cbar_kws={'label': 'Transition Probability'})

    # Add labels and title
    plt.xlabel('To Game', fontsize=14)
    plt.ylabel('From Game', fontsize=14)
    plt.title('Markov Transition Matrix', fontsize=18)

    # Show the plot
    plt.show()

import pandas as pd
from collections import Counter
import matplotlib.pyplot as plt

def plot_degree_distribution(weights_df: pd.DataFrame) -> None:
    """
    Plot the degree distribution of the game network based on the 'game1' and 'game2' columns.

    Args:
        weights_df (pd.DataFrame): DataFrame containing 'game1' and 'game2' columns that represent edges in the network.
    
    Returns:
        None: Displays a histogram of the degree distribution.
    """
    
    # Create a list of all nodes in both 'game1' and 'game2'
    edges = list(weights_df['game1']) + list(weights_df['game2'])

    # Count the number of edges per node (degree)
    degree_counts = Counter(edges)

    # Create a DataFrame from the degree counts
    degree_df = pd.DataFrame(degree_counts.items(), columns=['Node', 'Degree'])

    # Plot the degree distribution as a histogram
    plt.figure(figsize=(12, 6))
    plt.hist(degree_df['Degree'], bins=50, color='skyblue', edgecolor='black', log=True)
    plt.xlabel('Degree')
    plt.ylabel('Number of Nodes (log scale)')
    plt.title('Degree Distribution of the Game Network')
    plt.grid(axis='y', linestyle='-', alpha=0.7)
    plt.show()

def plot_graph_with_communities(G, partition, positions, popularity, str_type, figsize=(12, 12)):
    """
    Plots the graph with node colors based on community and positions from layout.
    
    Args:
        G (nx.Graph): The graph object.
        partition (dict): The community partition for each node.
        positions (dict): The positions for each node.
        popularity (dict): The popularity of each game to assign node size.
        figsize (tuple): The size of the plot (default is (12, 12)).
    """
    # Assign the size attribute to each node based on its popularity
    for node in G.nodes():
        G.nodes[node]['size'] = (popularity.get(node, 0) / 2000) ** 0.25

    # Create a list of node colors based on the community partition
    node_colors = [partition[node] for node in G.nodes()]
    
    # Create a list of node sizes based on the popularity attribute
    factor = 100 if str_type == 'game' else 30
    node_sizes = [G.nodes[node]['size'] * factor for node in G.nodes()]  # Scale node size
    
    # Draw the graph
    plt.figure(figsize=figsize)
    nx.draw_networkx_nodes(G, positions, node_color=node_colors, cmap=plt.cm.rainbow, node_size=node_sizes, alpha=0.8)
    nx.draw_networkx_edges(G, positions, alpha=0.1)
    nx.draw_networkx_labels(G, positions, font_size=6, font_color='black')
    
    # Add title and axis labels
    plt.title("Game Network with Communities", fontsize=16)
    plt.axis('off')  # Hide axes
    plt.show()
