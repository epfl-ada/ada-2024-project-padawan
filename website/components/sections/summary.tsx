import { HeatmapChart } from "../subs/heatmap"
import markovTransitionsData from "@/data/markov_matrix.json"
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from "react";
import { ScrollDown } from "../subs/scroll-down";
import { Button } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";
import { QuizTab } from "../subs/quiz-tab";


export function Summary() {

    const quizRef = useRef<{ resetQuiz: () => void } | null>(null);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleQuizSubmit = () => {
        setTimeout(() => {
            setQuizCompleted(true);
            setTimeout(() => {
                setShowHeatmap(true);
            }, 1000);
        }, 500);
    };

    const handleReset = () => {
        setQuizCompleted(false);
        setShowHeatmap(false);
        if (quizRef.current) {
            quizRef.current.resetQuiz();
        }
    };


    const { games, data } = markovTransitionsData
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
            <div className="slide flex justify-around items-center px-10 h-screen">
                {
                    !showHeatmap &&
                    (
                        <div className="flex flex-col w-5/12 space-y-5">
                            <div className={`${quizCompleted ? 'animate-fadeOut' : 'animate-fadeIn'} text-lg`}>
                                <h4 className="font-bold text-xl mb-4 border-b-2 pb-4" style={{ borderColor: '#E54D2E' }}>Interactions between communities</h4>
                                <p className="text-justify mb-4">
                                    Now that we have seen that some genres connect way more with some than others,
                                    we may come back to our games. The following heatmap links the 21 most popular games,
                                    taking into account the numbers of viewers commenting under a certain game that have also
                                    interacted with another one. This gives us, for each game, a partition of the 20 other games,
                                    ranging from the "furthest" to the "closest" one in terms of community.
                                </p>
                                <p className="text-justify mb-4">
                                    But remember, we won't let you discover the answer this easily, right? You should
                                    first take a test in the following quizz.
                                </p>
                            </div>
                        </div>
                    )
                }
                {
                    showHeatmap && <ScrollDown />
                }
                {
                    !showHeatmap &&
                    (
                        <div className={`${quizCompleted ? 'animate-fadeOut' : 'animate-fadeIn'} text-lg`}>
                            <QuizTab
                                question="Which of these pairs of games has the highest probability of players transitioning between them ?"
                                answers={[
                                    "The Sims => Grand Theft Auto",
                                    "Mortal Kombat => Street Fighters",
                                    "Roblox => Minecraft",
                                    "Fortnite => Call of Duty"
                                ]}
                                correctAnswerIndex={2}
                                onSubmitAction={handleQuizSubmit}
                                ref={quizRef}
                            />
                        </div>
                    )
                }
                {
                    showHeatmap &&
                    (
                        <div className={`${quizCompleted ? 'animate-fadeIn' : 'animate-fadeOut'} h-screen w-screen flex justify-center`}>
                            <HeatmapChart games={games} data={data} />
                        </div>
                    )
                }
                {
                    showHeatmap &&
                    (
                        <div className="absolute top-10 right-10">
                            <Button onClick={handleReset} size="3" variant="soft">
                                <ReloadIcon />
                            </Button>
                        </div>
                    )
                }

            </div>
            <div className="slide h-screen w-screen flex flex-col justify-center items-center">
                <div className="w-1/2">
                    <p className="text-justify text-lg mb-4 mt-4 border-t-2 pt-4" style={{ borderColor: '#E54D2E' }}>
                        You haven't seen the time fly? Neither have we. Sadly, this introductory adventure in the 
                        gaming world has almost come to an end.
                    </p>
                    <p className="text-justify text-lg mb-4">
                        We have provided you with the essentials to understand how YouTube gaming is shaped, the communities it hosts,
                        how its dynamics can be influenced by external factors, and how games can be categorized to appeal to specific
                        groups.
                    </p>
                    <p className="text-justify text-lg mb-4 border-b-2 pb-4" style={{ borderColor: '#E54D2E' }}>
                        Most importantly, we are now going to let you with the general interactions of these games and communities.
                        This overview should give you a better understanding of how this landscape operates, what might interest you,
                        and what interests others who share your interests. It’s time for us to thank you for making it this far, we
                        can’t wait to see you again in this marvellous world of gaming on YouTube. Enjoy the show!
                    </p>
                </div>
            </div>

        </section>
    )
}