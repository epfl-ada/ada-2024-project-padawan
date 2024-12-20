import polars as pl

def get_tags(videos_sample_df):
    """
    Processes the 'tags' column in the DataFrame and returns the tags and their counts.

    Args:
        videos_sample_df (pl.DataFrame): The DataFrame containing a 'tags' column.

    Returns:
        pl.DataFrame: A DataFrame with the tags and their counts.
    """
    # Process tags
    tags = (
        videos_sample_df
        .select('tags')
        .with_columns(pl.col("tags").str.to_lowercase())   # Convert to lowercase
        .with_columns(pl.col("tags").str.split(","))       # Split tags by comma
        .explode("tags")                                   # Explode to create a row for each tag
        .group_by("tags")                                  # Group by unique tags
        .count()                                           # Count occurrences of each tag
        .sort("count", descending=True)                   # Sort by count in descending order
    )
    
    return tags








