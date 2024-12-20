'use client'

import { ResponsiveChord } from '@nivo/chord'
import data from '@/data/genres_data.json';

export function GenresChordChart() {
    return (
        <div className="w-full h-full">
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
    )
}