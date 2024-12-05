'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/hero-section';
import { TrendsSection } from '@/components/trends-section';
import { CategorySection } from '@/components/category-section';
import XpBar from '@/components/xpbar';
import QuizTab from '@/components/quiz-tab';

export default function Home() {
    const [currentXP, setCurrentXP] = useState(2); // Manage XP state here
    const maxXP = 10;

    const question = "What is the most popular video game?";
    const answers = ["Roblox", "Minecraft", "GTA V", "Fortnite"];
    const correctAnswerIndex = 1;

    const handleCorrectAnswer = () => {
        setCurrentXP((prevXP) => Math.min(prevXP + 1, maxXP)); 
    };

    return (
        <>
            <HeroSection />
            <TrendsSection />
            <XpBar currentXP={currentXP} maxXP={maxXP} />
            <CategorySection />
            <QuizTab
                question={question}
                answers={answers}
                correctAnswerIndex={correctAnswerIndex}
                onCorrectAnswer={handleCorrectAnswer} 
            />
        </>
    );
}
