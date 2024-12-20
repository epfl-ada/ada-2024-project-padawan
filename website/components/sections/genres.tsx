import { GenresBarChart } from "../subs/genres-bar-chart"
import { GenresChordChart } from "../subs/genres-chord-chart"
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from "react";


export function Genres() {

    gsap.registerPlugin(useGSAP, ScrollTrigger);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

        const slides = container.querySelectorAll('.slide');
        slides.forEach((slide, _) => {
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
        })


        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section ref={containerRef}>
            <div className="slide w-screen h-screen flex justify-center items-center">
                <p className="w-1/2 p-20">
                    All these curves indicate a strong relationship between game releases, tournaments
                    and viewing metrics. Until now, we've pretty much focused on games, but what about
                    taking a step back ? We're going to investigate the genres, and the relationships
                    between them. We'll be using a dataset of nearly 40k video games to link them to their
                    genres and bridge the gap with our actual knowledge.
                </p>
                <div className="w-full mt-48">
                <GenresBarChart />
                </div>
            </div>
            <div className="slide">
                <GenresChordChart />
            </div>
        </section>
    )
}