import { Task } from "../entities/task";
import { BasicSettings, HolidayDefinition } from "../../types";

/**
 * Check if a date is a holiday based on settings.
 */
export function isHoliday(date: Date, holidayDef: HolidayDefinition): boolean {
  const dateStr = date.toISOString().split("T")[0];
  const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)

  // Extra workdays take precedence
  if (holidayDef.extra_workdays.includes(dateStr)) {
    return false;
  }

  // Extra holidays
  if (holidayDef.extra_holidays.includes(dateStr)) {
    return true;
  }

  // Weekend days
  if (holidayDef.weekend_days.includes(dayOfWeek)) {
    return true;
  }

  return false;
}

/**
 * Add working days to a start date, skipping holidays.
 */
export function addWorkingDays(
  startDate: Date,
  days: number,
  holidayDef: HolidayDefinition,
): Date {
  const result = new Date(startDate);
  let remainingDays = days;

  if (remainingDays <= 0) return result;

  // If start date is a holiday, move to the next working day first
  while (isHoliday(result, holidayDef)) {
    result.setDate(result.getDate() + 1);
  }

  let added = 0;
  while (added < remainingDays - 1) {
    result.setDate(result.getDate() + 1);
    if (!isHoliday(result, holidayDef)) {
      added++;
    }
  }

  return result;
}

/**
 * Subtract working days (for end_fixed scheduling).
 */
export function subtractWorkingDays(
  endDate: Date,
  days: number,
  holidayDef: HolidayDefinition,
): Date {
  const result = new Date(endDate);
  let remainingDays = days;

  if (remainingDays <= 0) return result;

  // If end date is a holiday, move to the previous working day first
  while (isHoliday(result, holidayDef)) {
    result.setDate(result.getDate() - 1);
  }

  let subtracted = 0;
  while (subtracted < remainingDays - 1) {
    result.setDate(result.getDate() - 1);
    if (!isHoliday(result, holidayDef)) {
      subtracted++;
    }
  }
  return result;
}

/**
 * Calculate the next working day after a given date.
 */
export function getNextWorkingDay(
  date: Date,
  holidayDef: HolidayDefinition,
): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  while (isHoliday(result, holidayDef)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/**
 * Calculate scheduled dates for all tasks.
 */
export function calculateScheduledTasks(
  tasks: Task[],
  settings: BasicSettings,
): Task[] {
  const holidayDef = settings.holiday_definition;
  const dailyWorkHours = settings.daily_work_hours || 8;

  // 1. Create a map for easy access and cloned tasks
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, { ...t }));

  // 2. Prepare for topological sort respecting display_order
  const inDegree = new Map<string, number>();
  tasks.forEach((t) => inDegree.set(t.id, 0));
  tasks.forEach((t) => {
    t.dependencies?.forEach((depId) => {
      if (inDegree.has(depId)) {
        inDegree.set(t.id, (inDegree.get(t.id) || 0) + 1);
      }
    });
  });

  // Initial queue: independent tasks
  let queue = tasks.filter((t) => (inDegree.get(t.id) || 0) === 0);
  queue.sort((a, b) => a.display_order - b.display_order);

  const sortedTasks: Task[] = [];
  const processedIds = new Set<string>();

  while (queue.length > 0) {
    const t = queue.shift()!;
    sortedTasks.push(taskMap.get(t.id)!);
    processedIds.add(t.id);

    tasks.forEach((dependentTask) => {
      if (dependentTask.dependencies?.includes(t.id)) {
        const currentDeg = inDegree.get(dependentTask.id)!;
        inDegree.set(dependentTask.id, currentDeg - 1);
        if (currentDeg - 1 === 0) {
          queue.push(dependentTask);
          queue.sort((a, b) => a.display_order - b.display_order);
        }
      }
    });
  }

  // Handle circular dependencies by adding remaining tasks
  tasks.forEach((t) => {
    if (!processedIds.has(t.id)) {
      sortedTasks.push(taskMap.get(t.id)!);
    }
  });

  // 3. Track resource usage per day (dateString -> usedHours)
  const assigneeResourceUsage = new Map<string, Map<string, number>>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  sortedTasks.forEach((task) => {
    const rule = task.scheduling_rule || "priority";
    const effortHours = task.planned_hours || 0;

    // Productivity Consideration
    let productivity = 1.0;
    if (task.assignee_id) {
      const assignee = settings.assignees.find(
        (a) => a.id === task.assignee_id,
      );
      if (assignee) {
        productivity = assignee.productivity_ratio || 1.0;
      }
    }
    const realEffortHours = effortHours / productivity;

    let calcStart: Date | null = null;
    let calcEnd: Date | null = null;

    // Determine the earliest possible search start date
    let searchStartSource = new Date(today);

    // Dependency constraint
    if (task.dependencies && task.dependencies.length > 0) {
      let maxDepEnd: Date | null = null;
      task.dependencies.forEach((depId) => {
        const depTask = taskMap.get(depId);
        if (depTask?.calculated_end_date) {
          const depEnd = new Date(depTask.calculated_end_date);
          if (!maxDepEnd || depEnd > maxDepEnd) {
            maxDepEnd = depEnd;
          }
        }
      });
      if (maxDepEnd) {
        // Task must start after the dependencies are finished
        searchStartSource = getNextWorkingDay(maxDepEnd, holidayDef);
      }
    }

    if (rule === "start_fixed" && task.start_date) {
      const fixedStart = new Date(task.start_date);
      // start_fixed always uses the user-specified start date
      searchStartSource = fixedStart;
    }

    if (rule === "end_fixed" && task.due_date) {
      // For end_fixed, we still calculate backwards but need to respect other tasks.
      // Simplification: Calculate backwards from due_date and mark as busy.
      // In a more complex engine, we'd find the latest slot.
      calcEnd = new Date(task.due_date);
      const effortDays = Math.ceil(realEffortHours / dailyWorkHours) || 1;
      calcStart = subtractWorkingDays(calcEnd, effortDays, holidayDef);

      // Mark resource as used (simplified for end_fixed: assume full days)
      if (task.assignee_id) {
        if (!assigneeResourceUsage.has(task.assignee_id)) {
          assigneeResourceUsage.set(task.assignee_id, new Map());
        }
        const usage = assigneeResourceUsage.get(task.assignee_id)!;
        let d = new Date(calcStart);
        while (d <= calcEnd) {
          if (!isHoliday(d, holidayDef)) {
            const dStr = d.toISOString().split("T")[0];
            usage.set(dStr, dailyWorkHours);
          }
          d.setDate(d.getDate() + 1);
        }
      }
    } else {
      // rule === "priority" or "start_fixed" or missing rule
      let remainingTaskHours = realEffortHours;
      if (remainingTaskHours <= 0) remainingTaskHours = 0.1; // Min 0.1h

      let currentD = new Date(searchStartSource);
      if (task.assignee_id && !assigneeResourceUsage.has(task.assignee_id)) {
        assigneeResourceUsage.set(task.assignee_id, new Map());
      }
      const usage = task.assignee_id
        ? assigneeResourceUsage.get(task.assignee_id)!
        : null;

      while (remainingTaskHours > 0) {
        if (!isHoliday(currentD, holidayDef)) {
          const dStr = currentD.toISOString().split("T")[0];
          const usedToday = usage?.get(dStr) || 0;
          const availableToday = dailyWorkHours - usedToday;

          if (availableToday > 0) {
            if (!calcStart) calcStart = new Date(currentD);
            const allocate = Math.min(availableToday, remainingTaskHours);
            if (usage) {
              usage.set(dStr, usedToday + allocate);
            }
            remainingTaskHours -= allocate;
            if (remainingTaskHours <= 0) {
              calcEnd = new Date(currentD);
            }
          }
        }
        if (remainingTaskHours > 0) {
          currentD.setDate(currentD.getDate() + 1);
        }
        // Safety break
        if (currentD.getFullYear() > today.getFullYear() + 5) break;
      }
    }

    if (calcStart && calcEnd) {
      task.calculated_start_date = calcStart.toISOString().split("T")[0];
      task.calculated_end_date = calcEnd.toISOString().split("T")[0];
    }
  });

  // 4. Handle Parent Task Aggregation (Bottom-Up)
  const parentMap = new Map<string, string[]>();
  sortedTasks.forEach((t) => {
    if (t.parent_id) {
      const children = parentMap.get(t.parent_id) || [];
      children.push(t.id);
      parentMap.set(t.parent_id, children);
    }
  });

  const roots = sortedTasks.filter((t) => !t.parent_id);

  function updateParentDates(taskId: string) {
    const childrenIds = parentMap.get(taskId);
    if (!childrenIds || childrenIds.length === 0) return;

    childrenIds.forEach(updateParentDates);

    const task = taskMap.get(taskId)!;
    const children = childrenIds.map((id) => taskMap.get(id)!);

    const startDates = children
      .map((c) => c.calculated_start_date)
      .filter((d): d is string => !!d);
    const endDates = children
      .map((c) => c.calculated_end_date)
      .filter((d): d is string => !!d);

    if (startDates.length > 0) {
      const minStart = startDates.reduce((a, b) => (a < b ? a : b));
      const maxEnd = endDates.reduce((a, b) => (a > b ? a : b));

      task.calculated_start_date = minStart;
      task.calculated_end_date = maxEnd;
    }
  }

  roots.forEach((t) => updateParentDates(t.id));

  return Array.from(taskMap.values());
}
