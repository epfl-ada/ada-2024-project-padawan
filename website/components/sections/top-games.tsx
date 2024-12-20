'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GameStatistics } from '../subs/game-statistics';
import gameData from '@/data/weekly_delta_views.json'
import BarRace from '../subs/bar-race';

interface Game {
    id: number;
    title: string;
    backgroundClip: string;
}

const games: Game[] = [
    { id: 3, title: 'Call of Duty', backgroundClip: '/videos/cod.mp4' },
    { id: 2, title: 'Fortnite', backgroundClip: '/videos/fortnite.mp4' },
    { id: 1, title: 'Minecraft', backgroundClip: '/videos/minecraft.mp4' },
];

export function TopGames() {
    gsap.registerPlugin(useGSAP, ScrollTrigger);

    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

        const slide = container.querySelector('.intro-slide')
        gsap.timeline({
            scrollTrigger: {
                trigger: slide,
                start: 'top top',
                end: '+=100%',
                scrub: true,
                pin: true,
                pinSpacing: false,
                anticipatePin: 1
            }
        })
            .to(slide, {
                opacity: 0,
            });

        const cards = container.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            const overlay = card.querySelector('.overlay');
            const textAnimation = card.querySelector('.text-animation');
            gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top top',
                    end: '+=100%',
                    scrub: true,
                    pin: true,
                    pinSpacing: index == cards.length - 1 ? true : false,
                    snap: {
                        snapTo: 'labels',
                        ease: 'power1.inOut',
                    }
                }
            })
                .from(card, {
                    opacity: 0,
                    y: 30,
                    duration: 0.1,
                })
                .from(textAnimation, {
                    opacity: 0,
                    duration: 0.1,
                }, "<"
                )
                .addLabel('title')
                .to(textAnimation, {
                    opacity: 0,
                    y: -30,
                    duration: 0.1,
                }, "+=60%"
                )
                .from(overlay, {
                    opacity: 0,
                    duration: 0.1,
                }, "+=10%"
                )
                .addLabel('overlay')
                .to(card, {
                    opacity: 0,
                    duration: 0.1
                }, "+=95%"
                )
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [games]);

    return (
        <div ref={containerRef}>
            <div className="intro-slide h-screen w-full flex gap-12 px-12 items-center">
                <div className="flex-1">
                    <h4 className="font-bold text-xl">Top Games</h4>
                    <p className="text-justify text-lg mb-4">
                        How to talk about gaming on YouTube without evocating them?
                    </p>
                    <p className="text-justify text-lg mb-4">
                        In this section, you are about to discover the most represented games on the platform. 
                        Even if they are not personal favourites, their impact is undeniable, and they are essential to comprehend the dynamics of the YouTube gaming world. 
                        Their influence goes far beyond their own fan bases and can be felt across all genres and communities. 
                        Indeed,even if you prefer more niche games, chances are the community you are the closest to intersects with those of these top games.
                    </p>
                    <p className="text-justify text-lg">
                        You can first see the weekly evolution of the ten games with the highest cumulative views from 2016 to 2019. 
                        We will then take a closer look at the three that reign on YouTube gaming.
                    </p>
                </div>
                <div className="flex-[2]">
                    <BarRace data={gameData} />
                </div>
            </div>
            {games.map((game, index) => (
                <div key={game.id} className={`relative overflow-hidden h-screen w-full game-card bg-black`}>
                    <video
                        src={game.backgroundClip}
                        autoPlay playsInline
                        loop muted
                        className="w-full h-full object-cover brightness-50"
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className="text-animation absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-6xl font-pixel">#{games.length - index}</p>
                        <p className="text-5xl font-bold font-pixel">{game.title}</p>
                    </div>
                    <div className="overlay absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center py-52">
                        <div className="statistics">
                            <GameStatistics gameTitle={game.title} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
