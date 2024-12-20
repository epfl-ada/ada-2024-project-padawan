"use client";

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { CategoriesChart } from '../subs/categories-chart';
import { DurationsChart } from '../subs/durations-chart';
import categoriesData from "@/data/categories.json";
import { QuizTab } from '../subs/quiz-tab';
import durationsData from "@/data/video_durations.json";
import { Button } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';
import { ScrollDown } from '../subs/scroll-down';


export function Introduction() {

    const quizRef1 = useRef<{ resetQuiz: () => void } | null>(null);
    const quizRef2 = useRef<{ resetQuiz: () => void } | null>(null);

    const handleReset1 = () => {
        setQuizCompleted1(false);
        setShowChart1(false);
        if (quizRef1.current) {
            quizRef1.current.resetQuiz();
        }
    }

    const handleReset2 = () => {
        setQuizCompleted2(false);
        setShowText2(false);
        if (quizRef2.current) {
            quizRef2.current.resetQuiz();
        }
    }

    const [showChart1, setShowChart1] = useState(false);
    const [quizCompleted1, setQuizCompleted1] = useState(false);

    const [showText2, setShowText2] = useState(false);
    const [quizCompleted2, setQuizCompleted2] = useState(false);


    const handleQuizSubmit1 = () => {
        setTimeout(() => {
            setQuizCompleted1(true);
            setTimeout(() => {
                setShowChart1(true);
            }, 1000);
        }, 500);
    };

    const handleQuizSubmit2 = () => {
        setTimeout(() => {
            setQuizCompleted2(true);
            setTimeout(() => {
                setShowText2(true);
            }, 1000);
        }, 500);
    };

    const { xAxisData, seriesData } = durationsData;

    gsap.registerPlugin(useGSAP, ScrollTrigger);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

        const slides = container.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: slide,
                    start: 'top top',
                    end: '+=100%',
                    scrub: true,
                    pin: true,
                    pinSpacing: false,
                    anticipatePin: 2
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
            <div className="slide flex justify-around items-center px-10 h-screen">
                <div className="flex flex-col w-5/12 space-y-5">
                    {
                        !showChart1 &&
                        (
                            <div className={`${quizCompleted1 ? 'animate-fadeOut' : 'animate-fadeIn'} text-lg`}>
                                <h4 className="font-bold text-xl">Your Mission</h4>
                                <p className="text-justify mb-4">
                                    As your journey begins, we'll guide you through gaming on YouTube.
                                    By the end of this introduction, you should have a better comprehension of gaming content, how it is influenced, and how its contributors shape it.
                                    You’ll also discover which aspects resonate most with you.
                                </p>
                                <p className="text-justify mb-4">
                                    But you won’t be only a passive observer, we’ll test your knowledge with simple checkpoints.
                                    These short quizzes are designed to help you understand the data and the insights we’ll provide you.
                                    Let’s try with our first quiz on the right!
                                </p>
                                <p className="text-justify">
                                    As you probably know, YouTube is the world’s largest video sharing platform. 
                                    It is bursting with content of all kinds, from music videos and cooking tutorials to educational lessons. 
                                    But do you know what part gaming represents in this?
                                </p>

                            </div>
                        )
                    }
                    {
                        showChart1 &&
                        (
                            <div className={`${quizCompleted1 ? 'animate-fadeIn' : 'animate-fadeOut'} text-lg`}>
                                <p className="text-justify mb-4">
                                    The pie chart on your right highlights that gaming constitutes YouTube’s biggest category, accounting for
                                    nearly 19% of all videos posted on the platform. This represents a vast amount of content creators
                                    and viewers brought together by a shared passion, and one more reason to dive more in-depth into it.
                                </p>
                                <p className="text-justify">
                                    You may wonder how we get this information and whether it’s reliable. The data used to accompany you through
                                    this journey comes from a massive dataset called YouNiverse. It includes metadata from English-speaking
                                    YouTube from 2005 to 2019, uploaded by anonymous users. Each YouTube category contains its own world. Let’s
                                    explore the most fascinating one to discover its trends, protagonists, and secrets.
                                </p>
                                <ScrollDown />
                            </div>

                        )
                    }
                </div>
                {
                    !showChart1 &&
                    (
                        <div className={`${quizCompleted1 ? 'animate-fadeOut' : 'animate-fadeIn'} text-lg`}>
                            <QuizTab
                                question="What percentage does gaming represent on YouTube ?"
                                answers={["11%", "19%", "26%", "54%"]}
                                correctAnswerIndex={1}
                                onSubmitAction={handleQuizSubmit1}
                            />
                        </div>
                    )
                }
                {
                    showChart1 &&
                    (
                        <div className="w-7/12">
                            <CategoriesChart data={categoriesData} />
                        </div>
                    )
                }
                {
                    showChart1 &&
                    (
                        <div className="absolute top-10 right-10">
                            <Button onClick={handleReset1} size="3" variant="soft">
                                <ReloadIcon />
                            </Button>
                        </div>
                    )
                }

            </div>
            <div className="slide flex justify-around items-center px-10 h-screen">
                {
                    !showText2 &&
                    (
                        <div className={`w-5/12 flex flex-col items-center justify-center text-lg ${quizCompleted2 ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                            <QuizTab
                                ref={quizRef2}
                                question="What does the 10-minute peak represent? "
                                answers={[
                                    "Min. duration for algorithm recommendation",
                                    "Best attention span for users",
                                    "Min. duration for more monetization control",
                                    "Min. duration for automatic subtitles"
                                ]}
                                correctAnswerIndex={2}
                                onSubmitAction={handleQuizSubmit2}
                            />
                        </div>
                    )
                }
                {
                    showText2 &&
                    (
                        <div className={`w-5/12 flex flex-col items-center justify-center pl-20 text-lg ${quizCompleted2 ? 'animate-fadeIn' : 'animate-fadeOut'}`}>
                            <p className="text-justify mb-4">
                                We were a bit petty on this one because a 10-minute-long video is also what people like to see best.
                                While this duration might seem like a sweet spot for viewer attention, there's more to the story: MONEY.
                                Indeed, gaming may be a passion, but YouTube is still a business.
                                The platform prioritizes longer videos for two main reasons.
                            </p>
                            <p className="text-justify mb-4">
                                First, their business model favours that to keep the viewers engaged for as long as possible, because more eyes on their videos equals more revenue.
                                The other factor concerns content creators.
                                Videos lasting 10 min videos unlock additional monetization features, including mid-roll ads, which allows them to place multiple advertisements throughout the video.
                                This significantly boosts their revenue, provided they meet the platform’s monetization criteria (having enough subscribers and watching hours).
                                Since a lot of creators aim to live off their passion, the prevalence of 10-minute videos reflects their strategic choice to optimize both viewer satisfaction and monetization potential.
                            </p>
                            <p className="text-justify mb-4">
                                Note that this chart only displays videos under one hour, representing 92.6% of videos.
                            </p>
                            <ScrollDown />
                        </div>
                    )
                }
                <div className="w-7/12 flex flex-col items-center justify-center space-y-10">
                    {
                        !showText2 &&
                        (

                            <div className={`${quizCompleted2 ? 'animate-fadeOut' : 'animate-fadeIn'} text-justify pr-20 text-lg`}>
                                <h4 className="font-bold text-xl">The Gaming World</h4>
                                <p>
                                    Here, no more ear-shattering music or boring maths lessons, everything surrounding us is just gaming.
                                    Sounds like a dream, doesn’t it?
                                    More than just watching someone else play, it’s about discovering trends, connecting with communities, and finding content that speaks to you.
                                </p>
                                <p>
                                    Let’s first explore the basic characteristics, starting with the average duration of videos.
                                    We observe an interesting peak at 10 minutes.
                                    Let’s test your intuition on the reason for this with a new question!
                                </p>
                            </div>
                        )
                    }
                    <div className="w-full">
                        <DurationsChart xAxisData={xAxisData} seriesData={seriesData} />
                    </div>
                    {
                        showText2 &&
                        (
                            <div>
                                <div className="absolute top-10 right-16">
                                    <Button onClick={handleReset2} size="3" variant="soft">
                                        <ReloadIcon />
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </section>
    );
}
