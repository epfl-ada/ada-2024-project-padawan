'use client'

import { ResponsiveChordCanvas } from '@nivo/chord'
import { AnimatedSection } from './animated-section';
import data from '@/data/genres_data.json';

const GenresSection = () => {
    return (
        <div>
            <AnimatedSection>
                <div className="w-full h-screen">
                    <ResponsiveChordCanvas
                        data={data.data}
                        keys={data.keys}
                        margin={{ top: 120, right: 300, bottom: 120, left: 100 }}
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
                                    0.8
                                ]
                            ]
                        }}
                        colors={
                            { scheme: 'tableau10' }
                        }
                        legends={[
                            {
                                anchor: 'right',
                                direction: 'column',
                                justify: false,
                                translateX: -20,
                                translateY: 0,
                                itemWidth: 120,
                                itemHeight: 15,
                                itemsSpacing: 0,
                                itemTextColor: '#999',
                                itemDirection: 'left-to-right',
                                symbolSize: 12,
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000'
                                        }
                                    }
                                ]
                            }
                        ]}
                        theme={{
                            labels: {
                                text: {
                                    fontSize: 16,
                                },
                            },
                            legends: {
                                text: {
                                    fontSize: 15,
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
            </AnimatedSection >
            <AnimatedSection >
                <div className="w-full text-center px-32 py-8 text-lg text-gray-300">
                    <p>
                        Some genres regularly appear together, while others are rarely or never paired. This tells us a lot about the potential connections between games and communities. Indeed, if you're passionate about Adventure games, you will often find that these games are linked to genres like RPG, Shooter or Platform. Thus, as an Adventure gamer, you are likely to be part of a broad community that spans multiple genres, offering diverse experiences and interactions.
                    </p>
                    <br />
                    <p>
                        On the other hand, genres like Sport, Card & Board Games, and MOBA tend to stay within their own circles. These genres are less likely to be paired with others, which means that players of these games may find themselves more isolated, focusing on their specific niche.
                    </p>
                    <br />
                    <p>
                        This chord reveals how your choice of game can shape the kind of community you belong to. Depending on the genre you prefer, you may find it easier to connect with other players from diverse backgrounds or, conversely, become more deeply immersed in a specific community. Feel free to review it further, Explorer, and see which genres align with your interests. This will give you an idea of whether you’re ready to expand your horizons or if you would rather stay within a closer circle.
                    </p>
                </div>
            </AnimatedSection >
        </div>

    )
}

export default GenresSection