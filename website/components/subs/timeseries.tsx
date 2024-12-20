import { useRef, useEffect } from 'react';
import { Flex, Box } from '@radix-ui/themes';
import * as echarts from 'echarts';


interface TimeSeriesData {
    title: {
        text: string;
    },
    xAxis: {
        data: string[];
    },
    series: {
        name: string;
        type: string;
        data: number[];
        markArea: {
            itemStyle: {
                color: string,
            },
            data: {
                name: string,
                xAxis: string,
            }[][]
        };
    }[],
}

interface TimeSeriesProps {
    data: TimeSeriesData;
}

export function TimeSeries({ data }: TimeSeriesProps) {

    const chartRef = useRef<HTMLDivElement>(null);

    const eventsData: TimeSeriesData = data;

    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const chartInstance = echarts.init(chartRef.current);
        const option = {
            darkmode: false,
            title: {
                text: eventsData.title.text,
                left: "center"
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                textStyle: {
                    color: '#aaa',
                },
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: eventsData.xAxis.data,
                splitLine: {
                    show: false
                },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: function (value: number) {
                        return `${value / 10 ** 6}M`
                    }
                },
                axisPointer: {
                    snap: true
                },
                splitLine: {
                    show: false
                }
            },
            series: [
                {
                    name: eventsData.series[0].name,
                    type: 'line',
                    smooth: true,
                    data: eventsData.series[0].data,
                    markArea: {
                        itemStyle: eventsData.series[0].markArea.itemStyle,
                        data: eventsData.series[0].markArea.data,
                        label: {
                            distance: 6,
                            color: 'grey'
                        }
                    }
                },
            ]
        };
        for (let i = 1; i < eventsData.series.length; i++) {
            option.series.push({
                name: eventsData.series[i].name,
                type: 'line',
                smooth: true,
                data: eventsData.series[i].data,
                markArea: {
                    itemStyle: eventsData.series[i].markArea.itemStyle,
                    data: eventsData.series[i].markArea.data,
                    label: {
                        distance: 6,
                        color: 'grey'
                    }
                }
            });
        }
        chartInstance.setOption(option);
    }, []);


    return (
        <Flex width="100%" justify="center" align="center">
            <Box ref={chartRef} className="w-full h-[80vh]" />
        </Flex>
    );
}