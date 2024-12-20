"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { GrGamepad } from "react-icons/gr";
import Link from "next/link";

interface Section {
    id: string;
    label: string;
}

interface NavbarProps {
    currentSection: string;
    sections: Section[];
}

export function Navbar({ currentSection, sections }: NavbarProps) {
    
    return (
        <NavigationMenu.Root className="fixed top-2 left-1/2 transform -translate-x-1/2 w-5/6 h-12 px-5 z-50 flex justify-between items-center backdrop-blur-3xl border border-amber-100/10 rounded-full bg-slate-700/20 shadow-lg">
            <Link href="#hero">
                <GrGamepad />
            </Link>
            <NavigationMenu.Sub className="flex justify-center list-none space-x-4">
                {sections.map((section) => (
                    <NavigationMenu.Item
                        key={section.id}
                        className={`${currentSection === section.id ? "border-b border-slate-100" : ""
                            } px-2 py-1`}
                    >
                        <NavigationMenu.Link
                            className="NavigationMenuLink"
                            href={`#${section.id}`}
                        >
                            {section.label}
                        </NavigationMenu.Link>
                    </NavigationMenu.Item>
                ))}
            </NavigationMenu.Sub>
            <Link href="https://github.com/epfl-ada/ada-2024-project-padawan" scroll={true}>
                <GitHubLogoIcon />
            </Link>
        </NavigationMenu.Root>
    );
}
