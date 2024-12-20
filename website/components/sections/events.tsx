import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { TimeSeries } from '../subs/timeseries';
import fifaTimeSeriesData from '@/data/views_fifa.json'
import lolTimeSeriesData from '@/data/views_lol.json'
import acTimeSeriesData from '@/data/views_ac.json'
import { QuizTab } from '../subs/quiz-tab';
import { ChevronDownIcon } from '@radix-ui/themes';
import { Button } from '@radix-ui/themes';
import { ReloadIcon } from '@radix-ui/react-icons';

export function Events() {

    const quizRef = useRef<{ resetQuiz: () => void } | null>(null);
    const [showText, setShowText] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleQuizSubmit = () => {
        setTimeout(() => {
            setQuizCompleted(true);
            setTimeout(() => {
                setShowText(true);
            }, 1000);
        }, 500);
    };

    const handleReset = () => {
        setQuizCompleted(false);
        setShowText(false);
        if (quizRef.current) {
            quizRef.current.resetQuiz();
        }
    };

    gsap.registerPlugin(useGSAP, ScrollTrigger);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const container = containerRef.current;
        if (!container) return;

        gsap.to(container.querySelector('.horizontal'), {
            xPercent: -100,
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                pin: true,
                pinSpacing: true,
                scrub: true,
                end: () => `+=${container.offsetWidth}`
            }
        });

        const slide = container.querySelector('.slide')
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
        <section ref={containerRef} className="overflow-hidden">
            <div className="horizontal flex w-[800vw]">
                <div className="w-screen h-screen flex items-center justify-center space-x-20">
                    <div className="flex flex-col space-y-5 w-1/3">
                        <h1 className="font-bold text-xl border-l-2 pl-4" style={{ borderColor: '#E54D2E' }}>Impact of real-world events</h1>
                        <p className="text-justify text-lg">
                            One of the key ways gamers connect with their favourite communities and games is through their dynamics,
                            the excitement and new experiences that break the routine. How many promising games have we seen fail
                            because they lacked regular updates or a sense of evolution. A powerful tool for games to keep their
                            communities engaged is through real-life events, and when it comes to this, fresh releases are among
                            the most impactful.
                        </p>
                        <p className="text-justify text-lg">
                            Show us you are warmed-up with this new quizz!
                        </p>
                    </div>
                    <div className="w-[40vw] text-lg">
                        {
                            !showText &&
                            (
                                <div className={`${quizCompleted ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                                    <QuizTab
                                        question="Which game license is the most impacted by new game releases ?"
                                        answers={["FIFA", "Just Cause", "Battlefield", "NBA 2K"]}
                                        correctAnswerIndex={0}
                                        onSubmitAction={handleQuizSubmit}
                                        ref={quizRef}
                                    />
                                </div>
                            )
                        }
                        {
                            showText &&
                            (
                                <div className={`${quizCompleted ? 'animate-fadeIn' : 'animate-fadeOut'} flex flex-col items-center space-y-5`}>
                                    <p className="text-justify text-lg border-l-2 pl-4" style={{ borderColor: '#E54D2E' }}>
                                        With a new release each year, FIFA is one of the most obvious examples
                                        of this impact of new versions releases. Here's a nice visualization of 
                                        this phenomenon, let's see how this translates into a concrete change in views. 
                                    </p>
                                    <ChevronDownIcon 
                                        className="w-8 h-8" 
                                        aria-label="Scroll down"
                                    />
                                </div>
                            )
                        }
                        {
                            showText &&
                            (
                                <div className="absolute top-10 left-10">
                                    <Button onClick={handleReset} size="3" variant="soft">
                                        <ReloadIcon />
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="h-screen w-[300vw] flex">
                    <TimeSeries data={fifaTimeSeriesData} />
                </div>
                <div className="h-screen w-[50vw] flex flex-col justify-center items-center mr-20">
                    <p className="text-justify text-lg  border-b-2 pb-4" style={{ borderColor: '#E54D2E' }}>
                        We observe that every new game of the franchise leads to a huge yearly views peak, while older
                        versions tend to fade. This demonstrates that communities around a fast-evolving game keep loyal
                        to the franchise while expecting regular updates.  
                    </p>
                    <p className="text-justify text-lg pt-4">
                        Let's see if we can generalize this. Firstly, on another game with regular updates. Then,
                        we'll try to catch the impact of e-sport tournaments rather than releases on the same metrics. 
                    </p>
                </div>
                <div className="h-screen w-[200vw] flex justify-center">
                    <TimeSeries data={acTimeSeriesData} />
                </div>
                <div className="h-screen w-[150vw] flex justify-center">
                    <TimeSeries data={lolTimeSeriesData} />
                </div>
                <div className="h-screen w-[50vw] flex flex-col justify-center items-center">
                    <p className="text-justify text-lg  border-b-2 pb-4" style={{ borderColor: '#E54D2E' }}>
                        How interesting is this! The game with the most well-known tournaments, League of Legends, 
                        shows the same peaks in views after those events than during our previous experiments. This 
                        makes sense: much more than just competitions, esport tournaments act as celebrations of the
                        gaming world. After all, what is more thrilling than watching the best of the best compete in 
                        the game and atmosphere you love? These events gather people and represent the spirit of gaming
                        communities.        
                    </p>
                    <p className="text-justify text-lg pt-4">
                        Until now, we've pretty much focused on individual video games. What about taking a step back, and
                        considering genres instead? Indeed, a genre describes the main gameplay mechanics and themes that
                        define the game. The exciting part? Most games don’t fit perfectly into a single genre. Instead, 
                        they often span multiple genres, allowing us to find interesting connections.
                    </p>
                </div>
            </div>
        </section>
    )
}