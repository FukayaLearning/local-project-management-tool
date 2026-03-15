import React from "react";
import { BarPosition } from "../../../../domain/services/ganttChartService";

interface GanttBarProps {
  barPosition: BarPosition;
  title: string;
  progress: number;
  isParent: boolean;
  depth: number;
  rowHeight: number;
}

export const GanttBar: React.FC<GanttBarProps> = ({
  barPosition,
  title,
  progress,
  isParent,
  rowHeight,
}) => {
  const barHeight = isParent ? 8 : 16;
  const barTop = (rowHeight - barHeight) / 2;

  const barColor = isParent ? "#6366f1" : "#3b82f6";
  const progressColor = isParent ? "#4f46e5" : "#2563eb";

  return (
    <div
      className="absolute"
      style={{
        left: barPosition.left,
        width: barPosition.width,
        top: barTop,
        height: barHeight,
      }}
      title={`${title} (${progress}%)`}
    >
      {/* Background bar */}
      <div
        className="absolute inset-0 rounded-sm opacity-40"
        style={{ backgroundColor: barColor }}
      />
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-sm"
        style={{
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: progressColor,
          opacity: 0.8,
        }}
      />
      {/* Parent task diamond markers */}
      {isParent && (
        <>
          <div
            className="absolute"
            style={{
              left: -3,
              top: -1,
              width: 6,
              height: 6,
              backgroundColor: barColor,
              transform: "rotate(45deg)",
            }}
          />
          <div
            className="absolute"
            style={{
              right: -3,
              top: -1,
              width: 6,
              height: 6,
              backgroundColor: barColor,
              transform: "rotate(45deg)",
            }}
          />
        </>
      )}
    </div>
  );
};
