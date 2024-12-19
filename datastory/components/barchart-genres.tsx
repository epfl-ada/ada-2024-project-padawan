'use client'

import * as echarts from 'echarts';
import { useEffect } from 'react';
import { AnimatedSection } from './animated-section';
import data from '@/data/barchart_genres.json';

const BarChart = () => {
  useEffect(() => {
    const chartDom = document.getElementById('main')!;
    const myChart = echarts.init(chartDom);

    const option = {
      xAxis: {
        type: 'category',
        data: data.genres,
        axisLabel: {
          interval: 0,
          rotate: 45,
          color: '#ffffff'
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
          color: '#ffffff'
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
        bottom: '20%'
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
    <AnimatedSection>
      <div className="w-full h-[400px]">
        <div id="main" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </AnimatedSection>
  );
};


export default BarChart