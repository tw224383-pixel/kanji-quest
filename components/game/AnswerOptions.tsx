"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

interface AnswerOptionsProps {
  choices: string[];
  displayChoices?: string[]; // ふりがなモード用：表示だけ差し替える（実際の判定には choices を使う）
  onAnswer: (ans: string) => void;
  disabled?: boolean;
}

export function AnswerOptions({ choices, displayChoices, onAnswer, disabled }: AnswerOptionsProps) {
  const labels = displayChoices && displayChoices.length === choices.length ? displayChoices : choices;
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
          {labels[i]}
        </Button>
      ))}
    </div>
  );
}
