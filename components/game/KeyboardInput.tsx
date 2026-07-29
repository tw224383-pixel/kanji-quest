"use client";

import { useState } from "react";
import { Button } from "../ui/Button";

interface KeyboardInputProps {
  onAnswer: (ans: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function KeyboardInput({ onAnswer, disabled, placeholder = "よみをひらがなでいれてね" }: KeyboardInputProps) {
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val) return;
    onAnswer(val.trim());
    setVal("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="px-4 py-3 text-2xl text-center rounded-xl border-4 border-gray-300 focus:outline-none focus:border-primary w-full"
      />
      <Button type="submit" variant="primary" size="lg" disabled={disabled || !val}>
        けってい
      </Button>
    </form>
  );
}
