'use client';
import { useState } from 'react';

interface QuizTabProps {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    onCorrectAnswer: () => void;
    onAnswerSubmit: () => void;
}

const QuizTab = ({ question, answers, correctAnswerIndex, onCorrectAnswer, onAnswerSubmit }: QuizTabProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleAnswerSelect = (index: number) => {
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === correctAnswerIndex) {
            onCorrectAnswer(); // Notify parent of the correct answer
        }
        setSubmitted(true);
        onAnswerSubmit();
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-black bg-opacity-70 font-pixel">
            <div className="p-6 rounded-xl shadow-xl text-white w-96">
                <div className="text-center text-lg font-mono mb-4">
                    <span className="block text-xl font-extrabold text-green-500 font-pixel">👾 QUIZ TIME 👾</span>
                    <p className="mt-2">{question}</p>
                </div>
                <div className="space-y-2 mb-4">
                    {answers.map((answer, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={submitted}
                            className={`w-full text-left p-3 rounded-md border-2 ${
                                submitted
                                    ? index === correctAnswerIndex
                                        ? 'bg-green-500 text-white'
                                        : index === selectedAnswer
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-800'
                                    : selectedAnswer === index
                                    ? 'bg-blue-500'
                                    : 'bg-gray-800'
                            }`}
                        >
                            {answer}
                            {submitted && index === correctAnswerIndex && (
                                <span className="ml-2">✔️</span>
                            )}
                            {submitted &&
                                index === selectedAnswer &&
                                index !== correctAnswerIndex && (
                                    <span className="ml-2">❌</span>
                                )}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full py-2 bg-blue-600 rounded-md text-white font-pixel mt-4 hover:bg-blue-700 disabled:bg-gray-600"
                    disabled={submitted}
                >
                    Submit Answer
                </button>
            </div>
        </div>
    );
};

export default QuizTab;
