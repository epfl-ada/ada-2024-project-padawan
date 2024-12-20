import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Flex, Box } from '@radix-ui/themes';

interface YouTubeCategory {
    name: string;
    value: number;
}

interface AnimatedPieChartProps {
    data: YouTubeCategory[];
}

export function CategoriesChart({ data }: AnimatedPieChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const chartInstance = echarts.init(chartRef.current);
        const options = {
            title: {
                text: 'Distribution of YouTube Categories',
                left: 'center',
                top: 20,
                textStyle: {
                    color: '#ccc'
                }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                textStyle: {
                    color: '#aaa',
                },
                formatter: (params: any) => {
                    return `<strong>${params.name}</strong> ${params.value}%`;
                }
            },
            series: [
                {
                    type: 'pie',
                    radius: [50, 250],
                    center: ['50%', '50%'],
                    data: data,
                    roseType: "radius",
                    label: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    },
                    labelLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.5)'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    },
                    itemStyle: {
                        borderRadius: 5,
                        color: '#E54D2E',
                        shadowBlur: 50,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    animationEasing: 'elasticIn',
                    animationDelay: function (idx: number) {
                        return idx * 200;
                    }
                }
            ]
        };
        chartInstance.setOption(options);
    }, []);

    return (
        <Flex
            width="100%"
            height="100%"
            justify="center"
            align="center"
        >
            <Box ref={chartRef} className="w-full h-[80vh]" />
        </Flex>
    );
}