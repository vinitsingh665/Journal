"use client";

import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export default function Sparkline({
  data,
  color = "#10b981", // default positive green
  width = 100,
  height = 32,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div 
        style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}
      >
        —
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  
  // Handle straight line case if min === max
  const range = max - min === 0 ? 1 : max - min;
  
  // Leave a tiny bit of padding top/bottom so stroke isn't clipped
  const padding = strokeWidth;
  const innerHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((d - min) / range) * innerHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
