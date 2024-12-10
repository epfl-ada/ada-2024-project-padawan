"use client";

import { motion } from "framer-motion";
import AnimatedPieChart from "./animated-pie-chart";
import { AnimatedSection } from "./animated-section";
import QuizTab from "./quiz-tab";
import { useState } from "react";

export function StartingInsightsSection() {
  // Sample data for the pie chart
const pieChartData = [
  { id: "Gaming", label: "Gaming", value: 55, color: "#FF5733" },
  { id: "Music", label: "Music", value: 20, color: "#33FF57" },
  { id: "Education", label: "Education", value: 15, color: "#3357FF" },
  { id: "Sports", label: "Sports", value: 7, color: "#FF33A6" },
  { id: "Other", label: "Other", value: 3, color: "#AAAAAA" }, // Example small segment
];

  const [showLegend, setShowLegend] = useState(false);

  // Fonction appelée à chaque soumission de réponse
  const handleAnswerSubmit = () => {
    setShowLegend(true);
  };

  return (
    <section
      id="starting-insights"
      className="section-container relative scroll-mt-30"
    >
      <AnimatedSection>
        <div>
          <p className="text-lg text-white text-center mb-10">
            As you probably know, YouTube is the world’s largest video sharing
            platform. It is bursting with content of all kinds, from music
            videos and cooking tutorials to educational lessons. But let’s focus
            on what brings you here: gaming. 🎮
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <QuizTab
            question="What color do you think represents Gaming in the graph?"
            answers={["Action", "Adventure", "RPG", "Simulation", "Caca"]}
            correctAnswerIndex={0}
            onCorrectAnswer={() => console.log("Correct answer!")}
            onAnswerSubmit={handleAnswerSubmit}
          />

          <div className="sm:w-2/3 lg:w-2/3 h-full flex flex-col">
            {/* Pie Chart */}
            <div className="flex justify-center items-center h-72">
              <AnimatedPieChart data={pieChartData} showLegend={showLegend} />
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
