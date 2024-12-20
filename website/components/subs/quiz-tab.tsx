"use client";
import { useState, forwardRef, useImperativeHandle } from "react";
import { Card, Text, Button, Flex, Box } from "@radix-ui/themes";
import {
    CheckCircledIcon,
    CrossCircledIcon,
    MixIcon,
} from "@radix-ui/react-icons";

interface QuizTabProps {
    question: string;
    answers: string[];
    correctAnswerIndex: number;
    onSubmitAction: () => void;
}

export const QuizTab = forwardRef((props: QuizTabProps, ref) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleAnswerSelect = (index: number) => {
        if (!submitted) {
            setSelectedAnswer(index);
        }
    };

    useImperativeHandle(ref, () => ({
        resetQuiz() {
            setSelectedAnswer(null);
            setSubmitted(false);
        }
    }));

    const handleSubmit = () => {
        setSubmitted(true);
        props.onSubmitAction();
    };

    return (
        <Flex direction="column" align="center" gap="4">
            <Card size="4" style={{ width: "100%", maxWidth: "600px" }}>
                <Flex direction="column" gap="4" p="4">
                    <Flex align="center" gap="2">
                        <MixIcon width="24" height="24" color="tomato" />
                        <Text size="5" weight="bold">
                            Quiz Time!
                        </Text>
                    </Flex>

                    <Text size="3" color="gray">
                        {props.question}
                    </Text>

                    <Flex direction="column" gap="2">
                        {props.answers.map((answer, index) => (
                            <Box
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`
                                            p-4 rounded-md cursor-pointer border-2 transition-all
                                            ${!submitted &&
                                        selectedAnswer === index
                                        ? "border-accent/70 bg-accent/10"
                                        : "border-slate-100/10"
                                    }
                                            ${submitted &&
                                        index === props.correctAnswerIndex
                                        ? "border-green-500 bg-green-500/10"
                                        : ""
                                    }
                                            ${submitted &&
                                        index === selectedAnswer &&
                                        index !== props.correctAnswerIndex
                                        ? "border-red-500 bg-red-500/10"
                                        : ""
                                    }
                                            ${!submitted
                                        ? "hover:border-accent/50"
                                        : ""
                                    }
                                        `}
                            >
                                <Flex justify="between" align="center">
                                    <Text>{answer}</Text>
                                    {submitted && index === props.correctAnswerIndex && (
                                        <CheckCircledIcon className="text-green-500" />
                                    )}
                                    {submitted &&
                                        index === selectedAnswer &&
                                        index !== props.correctAnswerIndex && (
                                            <CrossCircledIcon className="text-red-500" />
                                        )}
                                </Flex>
                            </Box>
                        ))}
                    </Flex>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitted || selectedAnswer === null}
                        size="3"
                        variant="classic"
                    >
                        Submit Answer
                    </Button>
                </Flex>
            </Card>
        </Flex>
    );
});
