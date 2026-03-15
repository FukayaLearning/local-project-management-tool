import { Task } from "../entities/task";

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface BarPosition {
  left: number;
  width: number;
}

export interface InazumaPoint {
  x: number;
  y: number;
}

export interface HierarchicalTask extends Task {
  depth: number;
  hasChildren: boolean;
}

/**
 * Calculate the date range for a parent task based on its children.
 * Returns the min start_date and max due_date of all children.
 */
export function calculateParentDateRange(childTasks: Task[]): DateRange | null {
  const startDates = childTasks
    .map((task) => task.start_date)
    .filter((date): date is string => date != null && date !== "");
  const endDates = childTasks
    .map((task) => task.due_date)
    .filter((date): date is string => date != null && date !== "");

  if (startDates.length === 0 && endDates.length === 0) {
    return null;
  }

  const allDates = [...startDates, ...endDates];
  const minDate =
    startDates.length > 0
      ? startDates.reduce((a, b) => (a < b ? a : b))
      : allDates.reduce((a, b) => (a < b ? a : b));
  const maxDate =
    endDates.length > 0
      ? endDates.reduce((a, b) => (a > b ? a : b))
      : allDates.reduce((a, b) => (a > b ? a : b));

  return { startDate: minDate, endDate: maxDate };
}

/**
 * Calculate the pixel position of a bar on the timeline.
 */
export function calculateBarPosition(
  startDate: string,
  dueDate: string,
  timelineStartDate: string,
  dayWidth: number,
): BarPosition {
  const start = new Date(startDate);
  const due = new Date(dueDate);
  const timelineStart = new Date(timelineStartDate);

  const startDiffDays = Math.floor(
    (start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  const durationDays =
    Math.floor((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    left: startDiffDays * dayWidth,
    width: Math.max(durationDays * dayWidth, dayWidth),
  };
}

/**
 * Calculate Inazuma (lightning) line points based on task progress.
 * For each task, the x coordinate represents the expected completion point
 * based on the reference date, adjusted by the progress rate.
 */
export function calculateInazumaLinePoints(
  tasks: HierarchicalTask[],
  referenceDate: string,
  timelineStartDate: string,
  dayWidth: number,
  rowHeight: number,
): InazumaPoint[] {
  const refDate = new Date(referenceDate);
  const timelineStart = new Date(timelineStartDate);
  const refDiffDays = Math.floor(
    (refDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  const referenceX = refDiffDays * dayWidth;

  return tasks
    .map((task, index) => {
      if (!task.start_date || !task.due_date) {
        return null;
      }

      const start = new Date(task.start_date);
      const due = new Date(task.due_date);
      const totalDuration = due.getTime() - start.getTime();

      if (totalDuration <= 0) {
        return {
          x: referenceX,
          y: index * rowHeight + rowHeight / 2,
        };
      }

      const expectedProgress = Math.min(
        Math.max((refDate.getTime() - start.getTime()) / totalDuration, 0),
        1,
      );
      const actualProgress = task.progress / 100;
      const progressDifference = actualProgress - expectedProgress;

      const startDiffDays = Math.floor(
        (start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24),
      );
      const durationDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

      const expectedX =
        (startDiffDays + durationDays * expectedProgress) * dayWidth;
      const offsetX = progressDifference * durationDays * dayWidth;

      return {
        x: expectedX + offsetX,
        y: index * rowHeight + rowHeight / 2,
      };
    })
    .filter((point): point is InazumaPoint => point !== null);
}

/**
 * Generate an array of dates for the timeline header.
 */
export function generateTimelineDates(
  startDate: string,
  endDate: string,
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Flatten tasks into a display order considering parent-child hierarchy.
 * Parent tasks appear before their children, with depth for indentation.
 */
export function flattenTasksWithHierarchy(tasks: Task[]): HierarchicalTask[] {
  const sortedTasks = [...tasks].sort(
    (a, b) => (a.display_order || 0) - (b.display_order || 0),
  );
  const taskMap = new Map<string, Task>();
  const childrenMap = new Map<string, Task[]>();

  sortedTasks.forEach((task) => {
    taskMap.set(task.id, task);
    if (task.parent_id) {
      const children = childrenMap.get(task.parent_id) || [];
      children.push(task);
      childrenMap.set(task.parent_id, children);
    }
  });

  const result: HierarchicalTask[] = [];
  const visited = new Set<string>();

  function addTaskAndChildren(task: Task, depth: number) {
    if (visited.has(task.id)) return;
    visited.add(task.id);

    const children = childrenMap.get(task.id) || [];
    result.push({
      ...task,
      depth,
      hasChildren: children.length > 0,
    });

    children.forEach((child) => addTaskAndChildren(child, depth + 1));
  }

  // Start with root tasks (no parent_id)
  const rootTasks = sortedTasks.filter(
    (task) => !task.parent_id || !taskMap.has(task.parent_id),
  );
  rootTasks.forEach((task) => addTaskAndChildren(task, 0));

  // Add any remaining tasks not reachable from roots
  sortedTasks.forEach((task) => {
    if (!visited.has(task.id)) {
      addTaskAndChildren(task, 0);
    }
  });

  return result;
}

/**
 * Calculate the overall timeline range from all tasks.
 * Adds padding days before and after.
 */
export function calculateTimelineRange(
  tasks: Task[],
  paddingDays: number = 3,
): DateRange | null {
  const allDates: string[] = [];

  tasks.forEach((task) => {
    if (task.start_date) allDates.push(task.start_date);
    if (task.due_date) allDates.push(task.due_date);
  });

  if (allDates.length === 0) return null;

  const minDate = allDates.reduce((a, b) => (a < b ? a : b));
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b));

  const start = new Date(minDate);
  start.setDate(start.getDate() - paddingDays);

  const end = new Date(maxDate);
  end.setDate(end.getDate() + paddingDays);

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}
