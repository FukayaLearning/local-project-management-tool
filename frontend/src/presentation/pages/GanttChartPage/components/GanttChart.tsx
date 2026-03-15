import React, { useRef } from "react";
import { Task } from "../../../../domain/entities/task";
import {
  InazumaPoint,
  calculateBarPosition,
  calculateInazumaLinePoints,
  generateTimelineDates,
  flattenTasksWithHierarchy,
  calculateTimelineRange,
  calculateParentDateRange,
} from "../../../../domain/services/ganttChartService";
import { TimelineHeader } from "./TimelineHeader";
import { GanttBar } from "./GanttBar";
import { InazumaLine } from "./InazumaLine";

interface GanttChartProps {
  tasks: Task[];
  dayWidth: number;
  rowHeight: number;
  showInazumaLine: boolean;
  referenceDate: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  dayWidth,
  rowHeight,
  showInazumaLine,
  referenceDate,
}) => {
  const chartBodyRef = useRef<HTMLDivElement>(null);

  const timelineRange = calculateTimelineRange(tasks);
  if (!timelineRange) {
    return (
      <div className="text-center text-gray-500 py-10">
        No tasks with dates to display. Add start/due dates to your tasks.
      </div>
    );
  }

  const timelineDates = generateTimelineDates(
    timelineRange.startDate,
    timelineRange.endDate,
  );
  const hierarchicalTasks = flattenTasksWithHierarchy(tasks);

  // Calculate parent date ranges
  const taskWithResolvedDates = hierarchicalTasks.map((task) => {
    if (task.hasChildren) {
      const children = tasks.filter((t) => t.parent_id === task.id);
      const range = calculateParentDateRange(children);
      if (range) {
        return {
          ...task,
          start_date: task.start_date || range.startDate,
          due_date: task.due_date || range.endDate,
        };
      }
    }
    return task;
  });

  const totalWidth = timelineDates.length * dayWidth;
  const totalHeight = taskWithResolvedDates.length * rowHeight;

  // Calculate Inazuma line
  let inazumaPoints: InazumaPoint[] = [];
  if (showInazumaLine) {
    inazumaPoints = calculateInazumaLinePoints(
      taskWithResolvedDates,
      referenceDate,
      timelineRange.startDate,
      dayWidth,
      rowHeight,
    );
  }

  // Reference date line position
  const refDate = new Date(referenceDate);
  const timelineStart = new Date(timelineRange.startDate);
  const refDiffDays = Math.floor(
    (refDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  const refLineX = refDiffDays * dayWidth;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex">
        {/* Task Label Column */}
        <div
          className="flex-shrink-0 border-r border-gray-300 bg-gray-50"
          style={{ width: 200 }}
        >
          {/* Header for label column */}
          <div className="h-8 border-b border-gray-300 flex items-center px-3 font-semibold text-sm text-gray-700">
            Task
          </div>
          {/* Task rows */}
          {taskWithResolvedDates.map((task) => (
            <div
              key={task.id}
              className="border-b border-gray-100 flex items-center px-3 text-sm truncate"
              style={{ height: rowHeight, paddingLeft: 12 + task.depth * 16 }}
              title={task.title}
            >
              <span
                className={
                  task.hasChildren
                    ? "font-semibold text-gray-800"
                    : "text-gray-600"
                }
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-grow overflow-x-auto" ref={chartBodyRef}>
          {/* Timeline Header */}
          <div style={{ minWidth: totalWidth }}>
            <div className="h-8">
              <TimelineHeader dates={timelineDates} dayWidth={dayWidth} />
            </div>
          </div>

          {/* Bar Area */}
          <div
            className="relative"
            style={{ minWidth: totalWidth, height: totalHeight }}
          >
            {/* Weekend background stripes */}
            {timelineDates.map((date) => {
              const dayOfWeek = new Date(date).getDay();
              if (dayOfWeek !== 0 && dayOfWeek !== 6) return null;
              const dateStart = new Date(date);
              const diffDays = Math.floor(
                (dateStart.getTime() - timelineStart.getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={`bg-${date}`}
                  className="absolute top-0 bottom-0 bg-gray-50"
                  style={{ left: diffDays * dayWidth, width: dayWidth }}
                />
              );
            })}

            {/* Grid lines */}
            {timelineDates.map((date) => {
              const dateStart = new Date(date);
              const diffDays = Math.floor(
                (dateStart.getTime() - timelineStart.getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <div
                  key={`grid-${date}`}
                  className="absolute top-0 bottom-0 border-r border-gray-100"
                  style={{ left: diffDays * dayWidth }}
                />
              );
            })}

            {/* Reference date line */}
            {refLineX > 0 && refLineX < totalWidth && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-orange-400 z-20"
                style={{ left: refLineX }}
                title={`Reference: ${referenceDate}`}
              />
            )}

            {/* Task rows */}
            {taskWithResolvedDates.map((task) => (
              <div
                key={task.id}
                className="relative border-b border-gray-100"
                style={{ height: rowHeight }}
              >
                {task.start_date && task.due_date && (
                  <GanttBar
                    barPosition={calculateBarPosition(
                      task.start_date,
                      task.due_date,
                      timelineRange.startDate,
                      dayWidth,
                    )}
                    title={task.title}
                    progress={task.progress}
                    isParent={task.hasChildren}
                    depth={task.depth}
                    rowHeight={rowHeight}
                  />
                )}
              </div>
            ))}

            {/* Inazuma Line overlay */}
            {showInazumaLine && inazumaPoints.length >= 2 && (
              <InazumaLine
                points={inazumaPoints}
                totalHeight={totalHeight}
                totalWidth={totalWidth}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
