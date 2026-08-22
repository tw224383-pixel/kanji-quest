"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

interface AnswerOptionsProps {
  choices: string[];
  onAnswer: (ans: string) => void;
  disabled?: boolean;
}

export function AnswerOptions({ choices, onAnswer, disabled }: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
      {choices.map((choice, i) => (
        <Button
          key={i}
          variant="outline"
          size="lg"
          onClick={() => onAnswer(choice)}
          disabled={disabled}
          className="w-full"
        >
          {choice}
        </Button>
      ))}
    </div>
  );
}
