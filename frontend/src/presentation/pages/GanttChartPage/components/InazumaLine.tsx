import React from "react";
import { InazumaPoint } from "../../../../domain/services/ganttChartService";

interface InazumaLineProps {
  points: InazumaPoint[];
  totalHeight: number;
  totalWidth: number;
}

export const InazumaLine: React.FC<InazumaLineProps> = ({
  points,
  totalHeight,
  totalWidth,
}) => {
  if (points.length < 2) return null;

  const pathData = points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: totalWidth, height: totalHeight }}
    >
      <path
        d={pathData}
        stroke="#ef4444"
        strokeWidth={2}
        fill="none"
        strokeDasharray="6 3"
      />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={3} fill="#ef4444" />
      ))}
    </svg>
  );
};
