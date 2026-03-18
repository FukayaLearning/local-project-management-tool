import React, { useRef, useState, useEffect } from "react";
import { Task } from "../../../../domain/entities/task";
import {
  InazumaPoint,
  calculateBarPosition,
  calculateInazumaLinePoints,
  generateTimelineDates,
  flattenTasksWithHierarchy,
  calculateTimelineRange,
  HierarchicalTask,
} from "../../../../domain/services/ganttChartService";
import { TimelineHeader } from "./TimelineHeader";
import { GanttBar } from "./GanttBar";
import { InazumaLine } from "./InazumaLine";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GanttChartProps {
  tasks: Task[];
  dayWidth: number;
  rowHeight: number;
  showInazumaLine: boolean;
  referenceDate: string;
  onReorder?: (orders: { id: string; display_order: number }[]) => void;
}

const SortableTaskLabel = ({
  task,
  rowHeight,
}: {
  task: HierarchicalTask;
  rowHeight: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? "0 5px 15px rgba(0,0,0,0.15)" : "none",
    height: rowHeight,
    paddingLeft: 12 + task.depth * 16,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-b border-gray-100 flex items-center px-3 text-sm truncate hover:bg-gray-100 ${
        isDragging ? "bg-white" : ""
      }`}
      {...attributes}
      {...listeners}
      title={task.title}
    >
      <span
        className={
          task.hasChildren ? "font-semibold text-gray-800" : "text-gray-600"
        }
      >
        {task.title}
      </span>
    </div>
  );
};

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  dayWidth,
  rowHeight,
  showInazumaLine,
  referenceDate,
  onReorder,
}) => {
  const chartBodyRef = useRef<HTMLDivElement>(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const timelineRange = calculateTimelineRange(localTasks);
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
  const hierarchicalTasks = flattenTasksWithHierarchy(localTasks);

  // Use pre-calculated dates from scheduledTasks
  const taskWithResolvedDates = hierarchicalTasks.map((task) => {
    return {
      ...task,
      start_date: task.calculated_start_date || task.start_date,
      due_date: task.calculated_end_date || task.due_date,
    };
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setLocalTasks((items) => {
        // Find indices in the flattened representation to get visual order
        const flatItems = flattenTasksWithHierarchy(items);
        const oldIndex = flatItems.findIndex((item) => item.id === active.id);
        const newIndex = flatItems.findIndex((item) => item.id === over?.id);

        const newFlatItems = arrayMove(flatItems, oldIndex, newIndex);

        if (onReorder) {
          const orders = newFlatItems.map((item, index) => ({
            id: item.id,
            display_order: index,
          }));
          onReorder(orders);
        }

        // Apply display orders back to local tasks for optimistic update
        const idToOrder = new Map();
        newFlatItems.forEach((item, idx) => idToOrder.set(item.id, idx));
        return items.map((t) => ({
          ...t,
          display_order: idToOrder.has(t.id)
            ? idToOrder.get(t.id)
            : t.display_order,
        }));
      });
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex">
        {/* Task Label Column */}
        <div
          className="flex-shrink-0 border-r border-gray-300 bg-gray-50 flex flex-col"
          style={{ width: 220 }}
        >
          {/* Header for label column */}
          <div className="h-8 border-b border-gray-300 flex items-center px-3 font-semibold text-sm text-gray-700">
            Task
          </div>
          {/* Task rows */}
          <div className="relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={taskWithResolvedDates.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {taskWithResolvedDates.map((task) => (
                  <SortableTaskLabel
                    key={task.id}
                    task={task}
                    rowHeight={rowHeight}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
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
