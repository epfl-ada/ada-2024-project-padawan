'use client'

import { Hero } from '@/components/sections/hero';
import { Introduction } from '@/components/sections/introduction';
import { TopGames } from '@/components/sections/top-games';
import { Genres } from '@/components/sections/genres';
import { NetworkGraph } from '@/components/sections/network-graph';
import { Navbar } from '@/components/sections/navbar';
import { Tags } from '@/components/sections/tags';
import { Events } from '@/components/sections/events';
import { useState, useEffect } from 'react';
import { Section } from '@radix-ui/themes';
interface Section {
    id: string;
    label: string;
}

export default function Home() {
    const [currentSection, setCurrentSection] = useState('');

    const sections: Section[] = [
        { id: 'intro', label: 'Intro' },
        { id: 'tags', label: 'Tags' },
        { id: 'top-games', label: 'Top Games' },
        { id: 'events', label: 'Events' },
        { id: 'genres', label: 'Genres' },
        { id: 'network', label: 'Network' },
    ];

    const handleScroll = () => {
        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 0 && rect.bottom >= 0) {
                    setCurrentSection(section.id);
                }
                else {
                    if (currentSection === section.id) {
                        setCurrentSection('');
                    }
                }
            }
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [sections]);

    return (
        <>
            <Navbar currentSection={currentSection} sections={sections} />
            <Section id="hero" p="0" ><Hero /></Section>
            <Section id="intro"><Introduction /></Section>
            <Section id="tags"><Tags /></Section>
            <Section id="top-games"><TopGames /></Section>
            <Section id="events"><Events /></Section>
            <Section id="genres"><Genres /></Section>
            <Section id="network"><NetworkGraph /></Section>
        </>
    );
}