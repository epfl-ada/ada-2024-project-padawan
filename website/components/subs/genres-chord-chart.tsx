'use client'

import { ResponsiveChord } from '@nivo/chord'
import data from '@/data/genres_data.json';

export function GenresChordChart() {
    return (
        <div className="relative flex">
            <div className="w-1/2 h-screen">
                <ResponsiveChord
                    data={data.data}
                    keys={data.keys}
                    margin={{ top: 170, right: 80, bottom: 170, left: 100 }}
                    valueFormat=".2f"
                    padAngle={0.006}
                    innerRadiusRatio={0.86}
                    inactiveArcOpacity={0.4}
                    arcBorderWidth={0}
                    arcBorderColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'darker',
                                0.4
                            ]
                        ]
                    }}
                    activeRibbonOpacity={0.75}
                    inactiveRibbonOpacity={0}
                    ribbonBorderWidth={0}
                    ribbonBorderColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'brighter',
                                0.4
                            ]
                        ]
                    }}
                    labelOffset={9}
                    labelRotation={-90}
                    labelTextColor={{
                        from: 'color',
                        modifiers: [
                            [
                                'brighter',
                                0.4
                            ]
                        ]
                    }}
                    colors={[
                        '#E54D2E', // YouTube Red
                        '#D3D3D3', // Light Grey
                        '#FFFFFF', // White
                        '#A9A9A9', // Dark Grey
                        '#F8B7A0', // Light Red
                    ]
                    }

                    theme={{
                        labels: {
                            text: {
                                fontSize: 16,
                            },
                        },
                        tooltip: {
                            container: {
                                background: "#000000",
                                color: "#ffffff",
                                fontSize: 16
                            },
                        },
                    }}
                />
            </div>
            <div className="w-1/2 p-12 flex flex-col justify-center">
                <div className="space-y-6 text-lg text-gray-300">
                    <p className="text-justify text-3xl text-white font-bold mb-4">
                        Genres Chord Chart
                    </p>
                    <p className="text-justify mb-4">
                    Some genres regularly appear together, while others are rarely or never paired. 
                    This tells us about the potential connections between games and communities. 
                    For example, if you're passionate about Adventure games, you will often find that these games are linked to genres like RPG, Platform, or Shooter. 
                    Thus, as an Adventure gamer, you are likely to be part of a broad community that spans multiple genres, offering diverse experiences and interactions.
                    </p>
                    <p className="text-justify mb-4">
                    On the contrary, genres like Sport or MOBA tend to stay within their own circles. 
                    They are less likely to be paired with others, which means that players of these games may find themselves more isolated, focusing on their specific niche. 
                    MOBA (Multiplayer Online Battle Arena) genre, despite hosting massive games like League of Legends or Dota 2, illustrates an intriguing case. 
                    While these games still attract vast communities, their genre probably limits them compared to more frequent crossovers. 
                    This underscores how genre clustering can restrict a game’s reach.
                    </p>
                </div>
            </div>
        </div>

    )
}