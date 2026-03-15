import { describe, it, expect } from "vitest";
import {
  calculateParentDateRange,
  calculateBarPosition,
  calculateInazumaLinePoints,
  generateTimelineDates,
  flattenTasksWithHierarchy,
  calculateTimelineRange,
  HierarchicalTask,
} from "../ganttChartService";
import { Task } from "../../entities/task";

// Helper to create a minimal task
function createTask(
  overrides: Partial<Task> & { id: string; title: string },
): Task {
  return {
    status: "New",
    progress: 0,
    display_order: 0,
    ...overrides,
  };
}

describe("GanttChartService", () => {
  describe("UNIT-FE-SVC-GANTT-001: calculateParentDateRange", () => {
    it("should return min start_date and max due_date from child tasks", () => {
      const children: Task[] = [
        createTask({
          id: "1",
          title: "Child A",
          start_date: "2024-03-10",
          due_date: "2024-03-15",
        }),
        createTask({
          id: "2",
          title: "Child B",
          start_date: "2024-03-05",
          due_date: "2024-03-20",
        }),
        createTask({
          id: "3",
          title: "Child C",
          start_date: "2024-03-08",
          due_date: "2024-03-18",
        }),
      ];

      const result = calculateParentDateRange(children);

      expect(result).not.toBeNull();
      expect(result!.startDate).toBe("2024-03-05");
      expect(result!.endDate).toBe("2024-03-20");
    });

    it("should return null when no children have dates", () => {
      const children: Task[] = [
        createTask({ id: "1", title: "Child A" }),
        createTask({ id: "2", title: "Child B" }),
      ];

      const result = calculateParentDateRange(children);

      expect(result).toBeNull();
    });

    it("should handle children with only start_date or only due_date", () => {
      const children: Task[] = [
        createTask({ id: "1", title: "Child A", start_date: "2024-03-10" }),
        createTask({ id: "2", title: "Child B", due_date: "2024-03-20" }),
      ];

      const result = calculateParentDateRange(children);

      expect(result).not.toBeNull();
      expect(result!.startDate).toBe("2024-03-10");
      expect(result!.endDate).toBe("2024-03-20");
    });
  });

  describe("UNIT-FE-SVC-GANTT-002: calculateBarPosition", () => {
    it("should calculate correct left and width based on dates and dayWidth", () => {
      const result = calculateBarPosition(
        "2024-03-05",
        "2024-03-10",
        "2024-03-01",
        40,
      );

      // start_date is 4 days after timeline start -> left = 4 * 40 = 160
      expect(result.left).toBe(4 * 40);
      // duration is 6 days (Mar 5 - Mar 10 inclusive) -> width = 6 * 40 = 240
      expect(result.width).toBe(6 * 40);
    });

    it("should return minimum width of dayWidth for same-day tasks", () => {
      const result = calculateBarPosition(
        "2024-03-05",
        "2024-03-05",
        "2024-03-01",
        40,
      );

      expect(result.left).toBe(4 * 40);
      expect(result.width).toBe(40); // 1 day = 1 * 40 = 40
    });

    it("should handle negative offset (task before timeline start)", () => {
      const result = calculateBarPosition(
        "2024-02-28",
        "2024-03-02",
        "2024-03-01",
        40,
      );

      // Feb 28 is 2 days before Mar 1 -> left = -2 * 40 = -80
      expect(result.left).toBe(-2 * 40);
    });
  });

  describe("UNIT-FE-SVC-GANTT-003: calculateInazumaLinePoints", () => {
    it("should calculate inazuma line points based on progress", () => {
      const tasks: HierarchicalTask[] = [
        {
          ...createTask({
            id: "1",
            title: "Task A",
            start_date: "2024-03-01",
            due_date: "2024-03-10",
            progress: 50,
          }),
          depth: 0,
          hasChildren: false,
        },
        {
          ...createTask({
            id: "2",
            title: "Task B",
            start_date: "2024-03-05",
            due_date: "2024-03-15",
            progress: 30,
          }),
          depth: 0,
          hasChildren: false,
        },
      ];

      const points = calculateInazumaLinePoints(
        tasks,
        "2024-03-06", // reference date
        "2024-03-01",
        40,
        36,
      );

      expect(points).toHaveLength(2);
      points.forEach((point) => {
        expect(point).toHaveProperty("x");
        expect(point).toHaveProperty("y");
        expect(typeof point.x).toBe("number");
        expect(typeof point.y).toBe("number");
      });
    });

    it("should skip tasks without dates", () => {
      const tasks: HierarchicalTask[] = [
        {
          ...createTask({ id: "1", title: "Task A" }),
          depth: 0,
          hasChildren: false,
        },
        {
          ...createTask({
            id: "2",
            title: "Task B",
            start_date: "2024-03-05",
            due_date: "2024-03-15",
            progress: 50,
          }),
          depth: 0,
          hasChildren: false,
        },
      ];

      const points = calculateInazumaLinePoints(
        tasks,
        "2024-03-10",
        "2024-03-01",
        40,
        36,
      );

      expect(points).toHaveLength(1);
    });

    it("should set correct y based on row index and rowHeight", () => {
      const tasks: HierarchicalTask[] = [
        {
          ...createTask({
            id: "1",
            title: "Task A",
            start_date: "2024-03-01",
            due_date: "2024-03-10",
            progress: 50,
          }),
          depth: 0,
          hasChildren: false,
        },
        {
          ...createTask({
            id: "2",
            title: "Task B",
            start_date: "2024-03-01",
            due_date: "2024-03-10",
            progress: 50,
          }),
          depth: 0,
          hasChildren: false,
        },
      ];

      const rowHeight = 36;
      const points = calculateInazumaLinePoints(
        tasks,
        "2024-03-05",
        "2024-03-01",
        40,
        rowHeight,
      );

      expect(points[0].y).toBe(0 * rowHeight + rowHeight / 2);
      expect(points[1].y).toBe(1 * rowHeight + rowHeight / 2);
    });
  });

  describe("UNIT-FE-SVC-GANTT-004: generateTimelineDates", () => {
    it("should generate consecutive dates from start to end", () => {
      const dates = generateTimelineDates("2024-03-01", "2024-03-05");

      expect(dates).toEqual([
        "2024-03-01",
        "2024-03-02",
        "2024-03-03",
        "2024-03-04",
        "2024-03-05",
      ]);
    });

    it("should return single date when start equals end", () => {
      const dates = generateTimelineDates("2024-03-01", "2024-03-01");

      expect(dates).toEqual(["2024-03-01"]);
    });

    it("should return empty array when start is after end", () => {
      const dates = generateTimelineDates("2024-03-05", "2024-03-01");

      expect(dates).toEqual([]);
    });
  });

  describe("UNIT-FE-SVC-GANTT-005: flattenTasksWithHierarchy", () => {
    it("should flatten with parent before children and correct depth", () => {
      const tasks: Task[] = [
        createTask({ id: "child1", title: "Child 1", parent_id: "parent1" }),
        createTask({ id: "parent1", title: "Parent 1" }),
        createTask({ id: "child2", title: "Child 2", parent_id: "parent1" }),
        createTask({ id: "root", title: "Root Task" }),
      ];

      const result = flattenTasksWithHierarchy(tasks);

      expect(result).toHaveLength(4);

      // Root tasks come first
      const parentIndex = result.findIndex((t) => t.id === "parent1");
      const child1Index = result.findIndex((t) => t.id === "child1");
      const child2Index = result.findIndex((t) => t.id === "child2");

      expect(parentIndex).toBeLessThan(child1Index);
      expect(parentIndex).toBeLessThan(child2Index);

      // Check depths
      expect(result.find((t) => t.id === "parent1")!.depth).toBe(0);
      expect(result.find((t) => t.id === "child1")!.depth).toBe(1);
      expect(result.find((t) => t.id === "child2")!.depth).toBe(1);
      expect(result.find((t) => t.id === "root")!.depth).toBe(0);

      // Check hasChildren
      expect(result.find((t) => t.id === "parent1")!.hasChildren).toBe(true);
      expect(result.find((t) => t.id === "child1")!.hasChildren).toBe(false);
      expect(result.find((t) => t.id === "root")!.hasChildren).toBe(false);
    });

    it("should handle empty task list", () => {
      const result = flattenTasksWithHierarchy([]);
      expect(result).toEqual([]);
    });

    it("should handle all root tasks (no parent)", () => {
      const tasks: Task[] = [
        createTask({ id: "1", title: "Task 1" }),
        createTask({ id: "2", title: "Task 2" }),
        createTask({ id: "3", title: "Task 3" }),
      ];

      const result = flattenTasksWithHierarchy(tasks);

      expect(result).toHaveLength(3);
      result.forEach((task) => {
        expect(task.depth).toBe(0);
        expect(task.hasChildren).toBe(false);
      });
    });

    it("should sort tasks by display_order before flattening", () => {
      const tasks: Task[] = [
        createTask({ id: "1", title: "Task 1", display_order: 2 }),
        createTask({ id: "2", title: "Task 2", display_order: 1 }),
        createTask({
          id: "3",
          title: "Task 3",
          parent_id: "2",
          display_order: 0,
        }),
      ];

      const result = flattenTasksWithHierarchy(tasks);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1");
    });
  });

  describe("calculateTimelineRange", () => {
    it("should calculate range with padding from all task dates", () => {
      const tasks: Task[] = [
        createTask({
          id: "1",
          title: "T1",
          start_date: "2024-03-05",
          due_date: "2024-03-10",
        }),
        createTask({
          id: "2",
          title: "T2",
          start_date: "2024-03-01",
          due_date: "2024-03-20",
        }),
      ];

      const result = calculateTimelineRange(tasks, 3);

      expect(result).not.toBeNull();
      // min date is 2024-03-01, minus 3 days = 2024-02-27
      expect(result!.startDate).toBe("2024-02-27");
      // max date is 2024-03-20, plus 3 days = 2024-03-23
      expect(result!.endDate).toBe("2024-03-23");
    });

    it("should return null for tasks with no dates", () => {
      const tasks: Task[] = [
        createTask({ id: "1", title: "T1" }),
        createTask({ id: "2", title: "T2" }),
      ];

      const result = calculateTimelineRange(tasks);
      expect(result).toBeNull();
    });
  });
});
