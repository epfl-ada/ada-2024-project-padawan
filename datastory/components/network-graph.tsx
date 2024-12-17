import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import networkData from "@/data/games_network.json";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { EChartsInstance } from "echarts-for-react";
import { useGSAP } from "@gsap/react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


type Highlight = {
    nodeIndices: number[];
    zoom: number;
    message: string;
};

const highlights: Highlight[] = [
    { nodeIndices: [-1], zoom: 1, message: "Here is a network of games linked by how many users made a comment on both games" },
    { nodeIndices: [1], zoom: 1.5, message: "First we can see that the most important node is Minecraft Enim mollit qui cupidatat enim consequat in non qui. Id ut laborum sunt incididunt. Consequat ad Lorem dolor ipsum adipisicing elit do irure velit eiusmod magna voluptate. Officia sunt minim veniam adipisicing minim non duis pariatur ipsum. Exercitation eiusmod ut veniam et laboris enim sint esse voluptate aliqua velit dolore consequat. Aute proident do duis officia quis anim magna esse veniam duis. Ut veniam Lorem veniam nostrud velit ut laborum ad sint." },
    { nodeIndices: [0], zoom: 2, message: "It is connected with Fortnite" },
    { nodeIndices: [2], zoom: 2, message: "Other important nodes" },
    { nodeIndices: [37, 35, 36, 45, 48, 49], zoom: 2, message: "And other nodes" },
    { nodeIndices: [117, 118], zoom: 3, message: "These nodes represent..." },
];

const NetworkGraph = () => {
    const [roamEnabled, setRoamEnabled] = useState(false);
    const [echartsInstance, setEchartsInstance] = useState<EChartsInstance | null>(null);
    const [data, setData] = useState<any>(networkData);

    const [currentMessage, setCurrentMessage] = useState(highlights[0].message);
    const messageRef = useRef(null);

    useGSAP(() => {
        if (!echartsInstance) return;

        gsap.registerPlugin(ScrollTrigger);

        // Animate initial message
        gsap.to(messageRef.current, {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        });

        // Handle highlights
        highlights.forEach((highlight, index) => {
            ScrollTrigger.create({
                trigger: ".network-container-wrapper",
                start: `${index * (100 / (highlights.length + 1))}% center`,
                end: `${(index + 1) * (100 / (highlights.length + 1))}% center`,
                markers: false,
                scrub: 1,
                onEnter: () => {
                    if (echartsInstance) {
                        handleHighlight(echartsInstance, highlight);
                    }
                    // Animate message change 
                    gsap.to(messageRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            setCurrentMessage(highlight.message);
                            gsap.to(messageRef.current, {
                                opacity: 1,
                                duration: 0.5
                            });
                        }
                    });
                },
                onEnterBack: () => {
                    if (echartsInstance) {
                        handleHighlight(echartsInstance, highlight);
                    }
                    // Animate message change
                    gsap.to(messageRef.current, {
                        opacity: 0,
                        duration: 0.5,
                        onComplete: () => {
                            setCurrentMessage(highlight.message);
                            gsap.to(messageRef.current, {
                                opacity: 1,
                                duration: 0.5
                            });
                        }
                    });
                }
            });
        });

        // Enable roam after last highlight
        ScrollTrigger.create({
            trigger: ".network-container-wrapper",
            start: `${highlights.length * (100 / (highlights.length + 1))}% center`, // After last highlight
            end: "100% center",
            markers: false,
            onEnter: () => {
                if (echartsInstance) {
                    // Clear any existing highlights
                    echartsInstance.setOption({
                        animationDurationUpdate: 3000,
                        series: [{
                            zoom: 1,
                            center: [0, 0]
                        }]
                    });
                    echartsInstance.dispatchAction({
                        type: 'downplay',
                        seriesIndex: 0
                    });
                    // Wait 1 second before enabling roam
                    setTimeout(() => {
                        setRoamEnabled(true);
                    }, 3000);
                }
            },
            onLeave: () => {
                setRoamEnabled(false);
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [echartsInstance]);

    const handleHighlight = (instance: EChartsInstance, highlight: Highlight) => {
        setRoamEnabled(false);
        if (highlight.nodeIndices[0] === -1) {
            instance.dispatchAction({
                type: 'downplay',
                seriesIndex: 0
            });
            instance.setOption({
                series: [{
                    zoom: highlight.zoom,
                    center: [0, 0]
                }]
            });
        } else {
            // Compute mean coordinates
            const meanX = highlight.nodeIndices.reduce((sum: number, idx: number) =>
                sum + networkData.nodes[idx].x, 0) / highlight.nodeIndices.length;
            const meanY = highlight.nodeIndices.reduce((sum: number, idx: number) =>
                sum + networkData.nodes[idx].y, 0) / highlight.nodeIndices.length;

            console.log(highlight.nodeIndices, meanX, meanY);
            instance.setOption({
                series: [{
                    zoom: highlight.zoom,
                    center: [meanX, meanY]
                }]
            });

            // Downplay all nodes first
            instance.dispatchAction({
                type: 'downplay',
                seriesIndex: 0
            });

            // Highlight each node in the array
            instance.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: highlight.nodeIndices
            });
        }
    };

    const getOption = () => ({
        darkMode: true,
        title: {
            text: 'Games Network',
            subtext: 'Default layout',
            top: 'bottom',
            left: 'right'
        },
        tooltip: {
            show: roamEnabled,
        },
        legend: [{
            show: roamEnabled,
            data: networkData.categories.map(a => a.name.toString()),
            top: 10,
            left: 10,
            textStyle: {
                color: '#aaa'
            },
        }],
        animationDuration: 1500,
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticOut',
        series: [{
            type: 'graph',
            layout: 'none',
            data: networkData.nodes,
            links: networkData.edges,
            categories: networkData.categories,
            roam: roamEnabled, // Enable roam for interactive exploration
            silent: !roamEnabled, // Disable hover effects when not in roam mode
            label: {
                show: true,
                position: "right",
                formatter: function (params: any) {
                    return params.name.split(' ')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                }
            },
            labelLayout: {
                hideOverlap: true,
            },
            itemStyle: {
                borderColor: "#000",
                borderWidth: 0.5,
            },
            lineStyle: {
                color: "source",
                curveness: 0.2,
                opacity: 0.2,
            },
            scaleLimit: {
                min: 0.9,
                max: 20,
            },
            emphasis: {
                focus: 'adjacency',
                lineStyle: {
                    width: 5,
                },
                itemStyle: {
                    borderColor: '#FFFAD8',
                    borderWidth: 2,
                },
            }
        }]
    });

    const onChartReady = (instance: EChartsInstance) => {
        setEchartsInstance(instance);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 network-container-wrapper relative h-[800vh]">
            <div className="network-container sticky top-[5rem] h-[calc(100vh-6rem)] flex flex-col justify-between gap-4 items-center">
                <div className="flex flex-row flex-wrap gap-4 justify-between w-full items-center">
                    <div className="flex gap-2 items-start text-md font-semibold italic text-[#fef094] p-3 flex-grow bg-[#171717] border border-[#333] rounded-lg opacity-0" ref={messageRef}>
                        <div className="flex-grow max-w-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="#ffffff" fillRule="evenodd" d="M8 2C4.262 2 1 4.57 1 8c0 1.86.98 3.486 2.455 4.566a3.472 3.472 0 0 1-.469 1.26a.75.75 0 0 0 .713 1.14a6.961 6.961 0 0 0 3.06-1.06c.403.062.818.094 1.241.094c3.738 0 7-2.57 7-6s-3.262-6-7-6M5 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2m7-1a1 1 0 1 1-2 0a1 1 0 0 1 2 0M8 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2" clipRule="evenodd"/></svg>
                        </div>
                        <div>{currentMessage}</div>
                    </div>
                </div>
                <div className="relative network-graph h-full w-full bg-[#171717] border border-[#333] rounded-lg">
                    <ReactECharts
                        option={getOption()}
                        style={{ height: '100%', width: '100%' }}
                        onChartReady={onChartReady}
                    />
                    <div className="absolute top-1 right-1 drop-shadow-md network-selectors bg-[#171717] border border-[#333] rounded-lg">
                        <div className="flex flex-row flex-wrap gap-1 p-1 items-center justify-between">
                            <button className="network-selector-button hover:bg-[#0A0B0C] hover:text-white text-[#BBB] w-28 flex-grow rounded-md p-2">Games</button>
                            <button className="network-selector-button hover:bg-[#0A0B0C] hover:text-white text-[#BBB] w-28 flex-grow rounded-md p-2">Channels</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkGraph;