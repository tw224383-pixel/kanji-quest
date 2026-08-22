"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/Button";

interface KeyboardInputProps {
  onAnswer: (ans: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isFraction?: boolean;
}

export function KeyboardInput({ onAnswer, disabled, placeholder = "よみをひらがなでいれてね", isFraction }: KeyboardInputProps) {
  const [val, setVal] = useState("");
  const [nVal, setNVal] = useState("");
  const [dVal, setDVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFraction) {
      if (!nVal || !dVal) return;
      onAnswer(`${nVal.trim()}/${dVal.trim()}`);
      setNVal("");
      setDVal("");
    } else {
      if (!val) return;
      onAnswer(val.trim());
      setVal("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {isFraction ? (
        <div className="flex flex-col items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={nVal}
            onChange={e => setNVal(e.target.value.replace(/[^0-9]/g, ''))}
            disabled={disabled}
            placeholder="分子"
            autoFocus={true}
            maxLength={4}
            className="w-32 px-2 py-3 text-3xl text-center font-black text-black bg-white/95 rounded-xl border-4 border-gray-300 focus:outline-none focus:border-primary shadow-lg"
          />
          <div className="w-40 h-2 bg-slate-800 rounded-full"></div>
          <input
            type="text"
            inputMode="numeric"
            value={dVal}
            onChange={e => setDVal(e.target.value.replace(/[^0-9]/g, ''))}
            disabled={disabled}
            placeholder="分母"
            maxLength={4}
            className="w-32 px-2 py-3 text-3xl text-center font-black text-black bg-white/95 rounded-xl border-4 border-gray-300 focus:outline-none focus:border-primary shadow-lg"
          />
        </div>
      ) : (
        <input
          type="text"
          value={val}
          onChange={e => setVal(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          autoFocus={true}
          className="px-4 py-3 text-3xl text-center font-black text-black bg-white/95 rounded-xl border-4 border-gray-300 focus:outline-none focus:border-primary w-full shadow-lg"
        />
      )}
      <Button type="submit" variant="primary" size="lg" disabled={disabled || (isFraction ? (!nVal || !dVal) : !val)}>
        けってい
      </Button>
    </form>
  );
}
