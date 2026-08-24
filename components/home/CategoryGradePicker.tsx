"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/Button";

type PickerCategory = { id: string; name: string; grade: number };

interface CategoryGradePickerProps {
  categories: PickerCategory[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  gradeLabel: (grade: number) => string;
  headingColorClass: string;
  chipSelectedClass: string;
}

// 理科・社会・算数の「学年ごとにカテゴリを選ぶ」UIは3画面ともほぼ同一構造だったため共通化した。
// 見た目のアクセントカラーだけ呼び出し側から渡す。
export function CategoryGradePicker({
  categories,
  selected,
  setSelected,
  gradeLabel,
  headingColorClass,
  chipSelectedClass,
}: CategoryGradePickerProps) {
  return (
    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {[1, 2, 3, 4, 5, 6].map(g => {
        const gradeCategories = categories.filter(c => c.grade === g);
        if (gradeCategories.length === 0) return null;
        const allSelected = gradeCategories.every(c => selected.includes(c.id));

        return (
          <div key={g} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 shadow-inner">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
              <h3 className={`text-xl font-black drop-shadow-md whitespace-nowrap ${headingColorClass}`}>
                {gradeLabel(g)}
              </h3>
              <Button
                size="sm"
                variant={allSelected ? "fun" : "outline"}
                className={`whitespace-nowrap ${allSelected ? "bg-amber-500 text-white text-xs border-amber-700" : "text-xs border-slate-500"}`}
                onClick={() => {
                  if (allSelected) {
                    if (selected.length > gradeCategories.length) {
                      setSelected(prev => prev.filter(id => !gradeCategories.find(c => c.id === id)));
                    }
                  } else {
                    const newCats = new Set([...selected, ...gradeCategories.map(c => c.id)]);
                    setSelected(Array.from(newCats));
                  }
                }}
              >
                {allSelected ? "すべて外す" : "すべて選ぶ"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {gradeCategories.map(cat => {
                const isSelected = selected.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (isSelected && selected.length > 1) {
                        setSelected(selected.filter(id => id !== cat.id));
                      } else if (!isSelected) {
                        setSelected([...selected, cat.id]);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all border-b-[3px] shadow-sm whitespace-nowrap ${
                      isSelected
                        ? `translate-y-1 border-b-0 ${chipSelectedClass}`
                        : "bg-slate-700 text-slate-300 border-slate-900 hover:bg-slate-600"
                    }`}
                  >
                    {isSelected && <span className="mr-1">✔️</span>}{cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
