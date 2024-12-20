'use client'

import * as echarts from 'echarts';
import { useEffect } from 'react';
import data from '@/data/barchart_genres.json';

export function GenresBarChart() {
    useEffect(() => {
        const chartDom = document.getElementById('genre')!;
        const myChart = echarts.init(chartDom);

        const option = {
            xAxis: {
                type: 'category',
                data: data.genres,
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    color: '#ffffff',
                    fontSize: 16
                },
                axisTick: {
                    alignWithLabel: true
                },
                axisLine: {
                    lineStyle: {
                        color: '#ffffff'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#ffffff',
                    fontSize: 16
                },
                splitLine: {
                    lineStyle: {
                        color: '#444'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#ffffff'
                    }
                }
            },
            series: [
                {
                    data: data.count,
                    type: 'bar',
                    barWidth: '60%',
                    itemStyle: {
                        color: '#E54D2E'
                    }
                }
            ],
            grid: {
                left: '15%',
                right: '15%',
                top: '20%',
                bottom: '20%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                textStyle: {
                    color: '#ffffff',
                },
                backgroundColor: '#333333',
                borderColor: '#555',
                borderWidth: 1
            }
        };

        myChart.setOption(option);
    }, []);

    return (
        <div className="relative w-full h-screen">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-white text-3xl font-bold p-4">
                Genres Counts
            </div>
            <div id="genre" className="w-full h-full"></div>
        </div>

    );
};
