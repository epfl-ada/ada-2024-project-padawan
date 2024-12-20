import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import maskImageSrc from '@/data/ps4.jpg';

interface Word {
    name: string;
    value: number;
}


interface WordCloudProps {
    data: Word[];
}


export function WordCloud({ data }: WordCloudProps) {
    const chartRef = useRef(null);
    const nbTags = 18925838;

    var colors = [
        'rgb(229, 77, 46)',
        'rgb(234, 47, 112)',
        'rgb(198, 68, 173)',
        'rgb(117, 100, 214)',
        'rgb(0, 120, 221)',
        'rgb(0, 127, 192)'
    ]

    useEffect(() => {
        const maskImage = new Image();
        maskImage.src = maskImageSrc.src;
        if (typeof window !== 'undefined') {
            import('echarts-wordcloud').then(() => {
                const chartInstance = echarts.init(chartRef.current);
                const options = {
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        textStyle: {
                            color: '#aaa',
                        },
                        formatter: (params: any) => {
                            return `<strong>${params.data.name}</strong> appears in <strong>${((params.data.value / nbTags) * 100).toFixed(3)}%</strong> of tags`;
                        }
                    },
                    series: [{
                        type: 'wordCloud',
                        shape: 'circle',
                        keepAspect: false,
                        left: 'center',
                        top: 'center',
                        width: '100%',
                        height: '100%',
                        sizeRange: [10, 60],
                        rotationRange: [0, 90],
                        rotationStep: 90,
                        gridSize: 8,
                        maskImage: maskImage,
                        drawOutOfBound: false,
                        shrinkToFit: true,
                        layoutAnimation: true,
                        textStyle: {
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            color: () => {
                                return colors[Math.floor(Math.random() * colors.length)];
                            },
                        },
                        emphasis: {
                            focus: 'self',
                            textStyle: {
                                textShadowBlur: 4,
                                textShadowColor: '#222',
                            },
                        },
                        data: data,
                    },
                    ],
                };
                chartInstance.setOption(options);
            });
        }
    }, []);

    return <div ref={chartRef} className="w-[99vw] h-screen" />;
};
