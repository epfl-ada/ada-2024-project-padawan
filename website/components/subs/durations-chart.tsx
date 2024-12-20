import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Flex, Box } from '@radix-ui/themes';


interface DurationsChartProps {
    xAxisData: number[];
    seriesData: number[];
}

export function DurationsChart({ xAxisData, seriesData }: DurationsChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const chartInstance = echarts.init(chartRef.current);
        const options = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                textStyle: {
                    color: '#aaa',
                },
                formatter: (params: any) => {
                    const totalSeconds = params.name;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    if (totalSeconds >= 60) {
                        return `<strong>${minutes}m ${seconds}s</strong>`;
                    } else {
                        return `<strong>${seconds}s</strong>`;
                    }
                }
            },
            xAxis: {
                data: xAxisData,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                splitLine: {
                    show: false
                }
            },
            series: {
                name: 'bar',
                type: 'bar',
                data: seriesData,
                emphasis: {
                    focus: 'series'
                },
                animationDelay: function (idx: number) {
                    return idx * 10;
                }
            },
            animationDelayUpdate: function (idx: number) {
                return idx * 5;
            }
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
            <Box ref={chartRef} className="w-full h-[60vh]" />
        </Flex>
    );
}