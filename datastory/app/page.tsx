'use client'

import { HeroSection } from '@/components/hero-section';
import { TrendsSection } from '@/components/trends-section';
import { CategorySection } from '@/components/category-section';
import { TopGames } from '@/components/top-games';
import NetworkGraph from '@/components/network-graph';
import { IntroductionSection } from '@/components/introduction-section';

export default function Home() {
    return (
        <>
            <div className="w-screen max-w-full"></div>
            <HeroSection />
            <IntroductionSection />
            <TopGames />
            <TrendsSection />
            <CategorySection />
            <NetworkGraph />
        </>
    );
}