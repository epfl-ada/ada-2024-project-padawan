# The dynamics of gaming on YouTube : A story about games, events and communities 🎮

## Abstract

We are presented with **YouNiverse**, A large-scale dataset about **channel** and **video metadata** from English-speaking **YouTube**. The dataset contains information about channels of different categories, time series of views and subscribers count, metadata of each crawled video as well as comment data across different videos. We created a datastorty centered on **gaming content** on YouTube through three major angles. We first investigated the **games** which generates the **most engagement** on the platform. Then, we observed the **influence** of **real-world events** in the gaming industry on the users' activity. Finally, we focused on the **dynamics** of different **video game communities** to explore how close they are and in what way they interact with each other. You can see our datastory [here](www.adaguleeer.ch) 

## Authors

- Jean Perbet | 341418 | <jean.perbet@epfl.ch>
- Maxime Ducourau | 329544 | <maxime.ducourau@epfl.ch>
- Léopold Henry | 327176 | <leopold.henry@epfl.ch>
- Martin Catheland | 345421 | <martin.catheland@epfl.ch>
- Mehdi Zoghlami | 326381 | <mehdi.zoghlami@epfl.ch>

## Project structure

This project is structured as follows:

```sh
├── .gitignore
├── data                                # data sources
│   ├── (youniverse)
│   │   ├── (filtered)                  # pre-filtered youniverse files
│   │   │   ├── (gaming_channels.tsv)
│   │   │   ├── (gaming_comments.tsv)
│   │   │   ├── (gaming_timeseries.tsv)
│   │   │   └── (gaming_videos.tsv)
│   │   └── (original)                  # original youniverse dataset
│   │       ├── (df_channels_en.tsv)
│   │       ├── (df_timeseries_en.tsv)
│   │       ├── (youtube_comments.tsv)
│   │       ├── (yt_metadata_helper.feather)
│   │       └── (yt_metadata_en.jsonl)
│   ├── esports_tournaments.csv
│   ├── games.csv
│   └── word_alpha.txt      
├── notebooks                          
│   ├── results.ipynb                   # main analysis notebook
│   └── prefiltering.ipynb              # data prefiltering notebook
├── src                     
│   ├── assign_games.ipynb              # to assign games to video and channels
│   ├── communities.ipynb               # to generate and separate the communities
│   ├── games_genres.ipynb              # to explore game genres
│   ├── gaming_representation.ipynb     # to compute statistics about games
│   ├── plotting.ipynb                  # plotting functions
│   ├── tags.ipynb                      # to clean and study tags
│   ├── timeseries.ipynb                # to study and generate timeseries
│   ├── exporting.ipynb                 # to generate files for the website
│   └── utils.py                        # general utility functions
├── requirements.txt                    # pip requirements file
└── README.md
```

## Run instructions

In order to run the code, you can follow these steps.

1. Download the missing YouNiverse dataset files, and include them in the project directory following the file structure above.

    | File | Description | Link | Size |
    | --- | --- | --- | --- |
    | `df_channels_en.tsv` | Channels metadata | [YouNiverse](https://zenodo.org/records/4650046) | 6 MB |
    | `df_timeseries_en.tsv` | Channels timeseries | [YouNiverse](https://zenodo.org/records/4650046) | 571 MB |
    | `youtube_comments.tsv` | Comments data | [YouNiverse](https://zenodo.org/records/4650046) | 77.2 GB |
    | `yt_metadata_helper.feather` | Videos metadata (light version) | [YouNiverse](https://zenodo.org/records/4650046) | 2.8 GB |
    | `yt_metadata_en.jsonl` | Videos metadata | [YouNiverse](https://zenodo.org/records/4650046) | 13.6 GB |

2. Install the required dependencies using `pip` and the following command. Try to create a virtual environment first using either `conda` or `venv`.

    ```sh
    pip install -r requirements.txt
    ```

3. Pre-filter the datasets, running `prefiltering.ipynb` notebook. This will generate the filtered datasets that will be used in the analysis. Do not forget to use the virtual environment with all dependencies you just downloaded.

4. Run all the cells in `results.ipynb` notebook. The cells will provide insights on the data, all our explanations as well as a formal explanation of the obtained results shown in the datastory

## Research questions

- What are the **most popular games** on YouTube?

- What is the **impact** of **real world events** in the gaming scene on the **metrics** of gaming creators on YouTube?

- How is the **gaming community structured** on YouTube? What are some communities that are likely to engage with each other's content?

These questions could enhance our understanding of the gaming community's expectations and help creators adapt their content accordingly. The first question indicates which games are the most relevant for our analysis. The second one explores **external factors**, offering insight into **optimal timing** and **content choices** for creators. The last question highlights possible hidden links and provides creators with ideas for potential **collaborations, cross-promotions, or targeted content** to **connect** with **specific audience** segments.

## Additional datasets

### [E-sport Tournaments Dataset](https://www.kaggle.com/datasets/hbakker/esports-200-tournaments)

This dataset provides more insights into the esports industry and contains specific information about tournaments with large prize pools. Here are the features of interest.

- `TournamentName`: Short-hand name of the tournament. (or full name if it's short enough)
- `StartDate`: Date the tournament started.
- `EndDate`: Date the tournament ended.

### [Popular Video Games](https://www.kaggle.com/datasets/matheusfonsecachaves/popular-video-games)

This dataset is a comprehensive collection of information about most of commercial video games ever released. It serves as a valuable resource for researchers, gamers, and enthusiasts interested in exploring the evolution of the gaming industry over the past decades. The features will be using are:

- `Title`: Title of the game
- `Release_Date`: Release date of the game
- `Genres`: Genres of the game

## Methods

### Prefiltering

Given the sheer size of our data, we need to reduce it as much as possible before analyzing it.

1. The initial step was to isolate all data related to the gaming category, meaning keeping only videos falling under the `Gaming` category, their corresponding channels and timeseries as well as the comments posted under gaming videos.

2. The next step was to drop all columns that were not relevant to our analysis.  

### Analysis

1. We started by studying all of the features we were provided with in our datasets: video categories, tags, upload dates, views and subscribers count. 

2. We assigned a video game to videos and channels and then studied the 3 most popular games on YouTube.

3. We picked famous video games and compared their average **performance metrics** before and after **main e-sports tournaments** and **game releases** of the corresponding video games

4. We also dedicated a section about **games genres** to study how they interact.

5. In order to understand the structure of gaming communities in YouTube we decided to create a graph where each node represents a channel and each edge represents how close are these channels in terms of their communities (In other words, to what extent do different fanbases **overlap**). We use the commment data, where the edge weights represent the number of users who commented on both channels represented by the nodes. We also created a similar graph for **video games**

### Organization within the team

| Member | Tasks |
| --- | --- |
| Jean |  Generating results in a notebook / Website development |
| Léopold |  Storytelling / Website development |
| Maxime | Generating results in a notebook |
| Martin | Gaming communities clustering / Website development  |
| Mehdi | Generating results in a notebook |

We decide to split the work between, **Maxime** and **Mehdi**, who will primarily work on generating the results, and **Martin** and **Jean**, who will focus on developing the website and **Léopold** who will develop a visual identity and write a story. This distribution is based on the members' preferences and skills, as well as the nature of the tasks.

Of course, everyone still participated in all the other tasks but these we our main missions.
