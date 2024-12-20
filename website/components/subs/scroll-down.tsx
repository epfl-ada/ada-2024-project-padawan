'use client';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useRef, useEffect, useState } from "react";

export function ScrollDown() {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);
    let scrollTimeout: NodeJS.Timeout;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            
            // Clear the previous timeout
            clearTimeout(scrollTimeout);
            
            // Set a new timeout
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 1000); // Will show again after 1 second of no scrolling
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    useGSAP(() => {
        // Initial animation setup
        const tl = gsap.timeline({ delay: 2 });

        // Set initial states
        gsap.set([containerRef.current, textRef.current], { autoAlpha: 0 });

        // Show elements and start bounce animation
        tl.to(containerRef.current, {
            autoAlpha: 1,
            duration: 0.5
        })
        .to(textRef.current, {
            autoAlpha: 1,
            duration: 0.5
        }, "+=2");

        // Continuous bounce animation
        gsap.to(containerRef.current, {
            y: 10,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

        // Handle scroll state
        if (isScrolling) {
            gsap.to(containerRef.current, {
                autoAlpha: 0,
                duration: 1
            });
        } else {
            gsap.to(containerRef.current, {
                autoAlpha: 1,
                duration: 1
            });
        }
    }, [isScrolling]); // React to scroll state changes

    return (
        <div ref={containerRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/75">
            <div className="flex flex-col items-center justify-center">
                <p ref={textRef} className="text-sm">Scroll down</p>
                <ChevronDownIcon 
                    className="w-8 h-8" 
                    aria-label="Scroll down"
                />
            </div>
        </div>
    );
}
