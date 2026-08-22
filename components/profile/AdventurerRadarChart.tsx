"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SkillStat, StatCategoryKey } from "../../lib/userStatsLogic";

interface AdventurerRadarChartProps {
  stats: SkillStat[];
  selectedKey?: StatCategoryKey | null;
  onSelectStat?: (key: StatCategoryKey) => void;
  size?: number;
}

export function AdventurerRadarChart({
  stats,
  selectedKey,
  onSelectStat,
  size = 360
}: AdventurerRadarChartProps) {
  const [hoveredKey, setHoveredKey] = useState<StatCategoryKey | null>(null);

  const viewBoxSize = 440;
  const center = viewBoxSize / 2; // 220
  const radius = 120;             // Radius for 100% stat value
  const labelRadius = 175;        // Radius for label badges
  const totalAxes = stats.length; // 6 axes

  // Calculate coordinates for a given index and value (0 - 100)
  const getCoordinates = (index: number, value: number, customRadius = radius) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2; // Start from top
    const r = (value / 100) * customRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric background grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];

  // Polygon points for the player's actual stat values
  const polygonPoints = useMemo(() => {
    return stats
      .map((s, i) => {
        const { x, y } = getCoordinates(i, Math.max(10, s.value));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [stats]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[380px] mx-auto">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="overflow-visible drop-shadow-xl"
      >
        <defs>
          {/* Radial Gradient for Radar Web Fill */}
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.35" />
          </radialGradient>

          {/* Glowing Shadow for Active Point */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Label Card Shadow */}
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Concentric Hexagon Background Grid */}
        {gridLevels.map((level, idx) => {
          const points = stats
            .map((_, i) => {
              const { x, y } = getCoordinates(i, level);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");

          const isOuter = idx === gridLevels.length - 1;
          return (
            <polygon
              key={`grid-${level}`}
              points={points}
              fill={isOuter ? "rgba(15, 23, 42, 0.6)" : "none"}
              stroke={isOuter ? "rgba(251, 191, 36, 0.7)" : "rgba(148, 163, 184, 0.25)"}
              strokeWidth={isOuter ? "2.5" : "1"}
              strokeDasharray={isOuter ? "none" : "3,3"}
            />
          );
        })}

        {/* Axis Lines from Center to Outer Vertex */}
        {stats.map((s, i) => {
          const { x, y } = getCoordinates(i, 100);
          const isSelected = selectedKey === s.key;
          return (
            <line
              key={`axis-${s.key}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={isSelected ? s.color : "rgba(148, 163, 184, 0.4)"}
              strokeWidth={isSelected ? "3" : "1.5"}
            />
          );
        })}

        {/* Animated Filled Radar Stat Polygon (Stable, no position jitter) */}
        <polygon
          points={polygonPoints}
          fill="url(#radarFill)"
          stroke="#fbbf24"
          strokeWidth="3.5"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Vertex Dots with Stable Selection Ring */}
        {stats.map((s, i) => {
          const { x, y } = getCoordinates(i, Math.max(10, s.value));
          const isSelected = selectedKey === s.key;
          const isHovered = hoveredKey === s.key;

          return (
            <g
              key={`vertex-${s.key}`}
              className="cursor-pointer"
              onClick={() => onSelectStat && onSelectStat(s.key)}
              onMouseEnter={() => setHoveredKey(s.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              {/* Outer halo ring if selected (NO jittery CSS animation) */}
              {(isSelected || isHovered) && (
                <circle
                  cx={x}
                  cy={y}
                  r="11"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  opacity={isSelected ? 1 : 0.6}
                />
              )}
              {/* Point */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 7 : (isHovered ? 6 : 4.5)}
                fill={isSelected ? "#ffffff" : s.color}
                stroke="#0f172a"
                strokeWidth="2"
                filter="url(#glow)"
              />
            </g>
          );
        })}

        {/* Center Power Badge */}
        <g transform={`translate(${center}, ${center})`}>
          <circle
            r="26"
            fill="#090d16"
            stroke="#fbbf24"
            strokeWidth="2.5"
            filter="url(#badgeShadow)"
          />
          <text
            y="-4"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9px"
            fontWeight="900"
            letterSpacing="1"
          >
            TOTAL
          </text>
          <text
            y="13"
            textAnchor="middle"
            fill="#fbbf24"
            fontSize="15px"
            fontWeight="900"
          >
            Lv.{Math.round(stats.reduce((acc, s) => acc + s.level, 0) / stats.length)}
          </text>
        </g>

        {/* Outer Axis Labels (100% jitter-free native SVG badges) */}
        {stats.map((s, i) => {
          const { x, y } = getCoordinates(i, 100, labelRadius);
          const isSelected = selectedKey === s.key;
          const isHovered = hoveredKey === s.key;
          const boxWidth = 104;
          const boxHeight = 46;

          return (
            <g
              key={`label-${s.key}`}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer"
              onClick={() => onSelectStat && onSelectStat(s.key)}
              onMouseEnter={() => setHoveredKey(s.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              {/* Label Pill Box */}
              <rect
                x={-boxWidth / 2}
                y={-boxHeight / 2}
                width={boxWidth}
                height={boxHeight}
                rx="14"
                fill={isSelected ? "#090d16" : (isHovered ? "#334155" : "#1e293b")}
                stroke={isSelected ? "#fbbf24" : (isHovered ? "#93c5fd" : s.color)}
                strokeWidth={isSelected ? "3" : (isHovered ? "2.5" : "1.5")}
                filter="url(#badgeShadow)"
              />

              {/* Title text: Icon + ShortName */}
              <text
                x="0"
                y="-3"
                textAnchor="middle"
                fill={isSelected ? "#fbbf24" : "#ffffff"}
                fontSize="13px"
                fontWeight="900"
                className="select-none"
              >
                {s.icon} {s.shortName}
              </text>

              {/* Subtitle text: Lv.XX Rank S */}
              <text
                x="0"
                y="15"
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="11.5px"
                fontWeight="800"
                className="select-none"
              >
                <tspan fill="#fbbf24" fontWeight="900">Lv.{s.level}</tspan>
                <tspan fill="#94a3b8"> (</tspan>
                <tspan fill="#38bdf8" fontWeight="900">{s.rank}</tspan>
                <tspan fill="#94a3b8">)</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
