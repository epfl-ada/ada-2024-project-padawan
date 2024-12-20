import { WordCloud } from "../subs/word-cloud";
import wordCloudData from "@/data/word_cloud.json";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from "react";
import { QuizTab } from "../subs/quiz-tab";
import { ScrollDown } from "../subs/scroll-down";
import { Button } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";

export function Tags() {

    const [showWordCloud, setShowWordCloud] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleQuizSubmit = () => {
        setTimeout(() => {
            setQuizCompleted(true);
            setTimeout(() => {
                setShowWordCloud(true);
            }, 1000);
        }, 500);
    };

    const quizRef = useRef<{ resetQuiz: () => void } | null>(null);

    const handleReset = () => {
        setShowWordCloud(false);
        setQuizCompleted(false);
        if (quizRef.current) {
            quizRef.current.resetQuiz();
        }
    }

    gsap.registerPlugin(useGSAP, ScrollTrigger);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

        const slide = container.querySelector('.slide');

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


        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);


    return (
        <section ref={containerRef}>
            <div className="slide">
                {
                    !showWordCloud &&
                    (
                        <div className={`h-screen flex justify-around items-center px-10 text-lg ${quizCompleted ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                            <div className="flex flex-col w-5/12 space-y-5 pl-10">
                                <h4 className="font-bold text-xl">Tags Overview</h4>
                                <p className="text-justify mb-4">
                                    Another point to study the evolution of communities and identify emerging patterns is through tags.
                                    Tags are a double-edged sword.
                                    They help viewers discover videos on their topics of interest or receive recommendations aligned with their preferences.
                                    However, some creators tend to overuse them to attract more views, leading to noisy data.

                                </p>
                                <p className="text-justify">
                                    Despite this apparent drawback, tags are essential for assigning every video to a specific game.
                                    If a game name is fully contained in a video title or its associated tags, we can link the video to that game, which is crucial for the core of our analysis.
                                    Let’s have a look at the most used ones.
                                </p>
                            </div>
                            <div className="pr-10">
                                <QuizTab
                                    ref={quizRef}
                                    question="What do you think is the most frequenly used tag under gaming videos ?"
                                    answers={["funny", "reaction", "pc", "gameplay"]}
                                    correctAnswerIndex={3}
                                    onSubmitAction={handleQuizSubmit}
                                />
                            </div>
                        </div>
                    )
                }
                {/* {
                    showWordCloud && <WordCloud data={wordCloudData} />
                } */}
                <div className={`${showWordCloud ? '' : 'hidden'} ${quizCompleted ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
                    <WordCloud data={wordCloudData} />
                    <ScrollDown />
                </div>
                {
                    showWordCloud &&
                    (
                        <div className="absolute top-10 right-16">
                            <Button onClick={handleReset} size="3" variant="soft">
                                <ReloadIcon />
                            </Button>
                        </div>
                    )
                }
            </div>
        </section>
    )
}