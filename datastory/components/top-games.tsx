'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GameStatistics } from './game-statistics';


interface Game {
    id: number;
    title: string;
    genre: string;
    studio: string;
    backgroundClip: string;
}

const games: Game[] = [
    { id: 1, title: 'Grand Theft Auto V', genre: 'Cars', studio: 'Rockstar', backgroundClip: '/videos/gta.mp4' },
    { id: 2, title: 'League of Legends', genre: 'Strategy',  studio: 'Riot Games', backgroundClip: '/videos/lol.mp4' },
    { id: 3, title: 'Roblox', genre: 'Sandbox', studio: 'Roblox Corporation', backgroundClip: '/videos/roblox.mp4' },
    { id: 4, title: 'Call of Duty', genre: 'RPG', studio: 'Activision', backgroundClip: '/videos/cod.mp4' },
    { id: 5, title: 'Fortnite', genre: 'Battle Royale', studio: 'Epic Games', backgroundClip: '/videos/fortnite.mp4' },
    { id: 6, title: 'Minecraft', genre: 'Sandbox', studio: 'Mojang', backgroundClip: '/videos/minecraft.mp4' },
];

export function TopGames() {
    gsap.registerPlugin(useGSAP, ScrollTrigger);

    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

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
                        snapTo: 'labelsDirectional',
                        ease: 'power1.inOut',
                    }
                }
            })
            .from(card, { 
                opacity: 0,
                duration: 0.1,
            })
            .from(textAnimation, {
                    opacity: 0,
                    y: 30,
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
        <div ref={containerRef} className="">
            {games.map((game, index) => (
                <div key={game.id} className={`relative w-full h-auto game-card bg-black overflow-hidden rounded-lg shadow-lg`}>
                    <video 
                        src={game.backgroundClip} 
                        autoPlay playsInline 
                        loop muted 
                        className="w-full h-auto object-cover brightness-50"
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className="text-animation absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-4xl font-pixel">#{games.length - index}</p>
                        <p className="text-2xl font-pixel">{game.title}</p>
                    </div>
                    <div className="overlay absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center p-52">
                        <GameStatistics />
                    </div>
                </div>
            ))}
        </div>
    );
}
