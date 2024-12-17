'use client';

import { GamepadIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="sticky top-0 z-50 border-b border-secondary bg-background/80 backdrop-blur-sm"
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center space-x-2">
                    <GamepadIcon className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">Gaming Trends</span>
                </Link>
                <div className="flex items-center space-x-6">
                    <Link href="#trends" className="hover:text-primary">
                        Trends
                    </Link>
                    <Link href="#categories" className="hover:text-primary">
                        Categories
                    </Link>
                    <Link href="#network" className="hover:text-primary">
                        Network
                    </Link>
                </div>
            </nav>
        </motion.header>
    );
}