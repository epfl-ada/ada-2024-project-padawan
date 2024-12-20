import pandas as pd

def process_category_percentages(videos_metadata_df):
    """
    Process the category percentages in the videos_metadata_df DataFrame.

    Args:
        videos_metadata_df (pd.DataFrame): DataFrame containing video metadata.
    
    Returns:
        pd.DataFrame: A DataFrame with the category percentages processed.
    """
    # Calculate category percentages
    true_category_percentages_df = (
        videos_metadata_df["categories"]
        .value_counts(normalize=True)
        .mul(100)
        .round(2)
        .to_frame()
    )

    # Filter categories with percentage >= 3
    pie_values_df = pd.DataFrame(
        true_category_percentages_df[true_category_percentages_df >= 3]
    )

    # Combine categories with percentage < 3 into 'Other'
    less_than_3 = true_category_percentages_df[true_category_percentages_df < 3]
    sum_less_than_3 = less_than_3.sum()
    pie_values_df.loc["Other"] = sum_less_than_3

    # Rename columns and drop NaN values
    pie_values_df = pie_values_df.rename(columns={"proportion": "value"}).dropna()

    return pie_values_df