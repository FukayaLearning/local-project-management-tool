import { describe, it, expect } from "vitest";
import {
  isHoliday,
  addWorkingDays,
  subtractWorkingDays,
  calculateScheduledTasks,
} from "../taskCalculationService";
import { Task } from "../../entities/task";
import { BasicSettings } from "../../../types";

const mockHolidayDef = {
  holiday_csv_url: "",
  weekend_days: [0, 6], // Sunday, Saturday
  extra_holidays: ["2024-01-01"],
  extra_workdays: ["2024-01-06"], // Saturday as workday
};

const mockSettings: BasicSettings = {
  task_statuses: [],
  task_types: [],
  assignees: [],
  daily_work_hours: 8,
  holiday_definition: mockHolidayDef,
};

function createTask(overrides: Partial<Task>): Task {
  return {
    id: "test",
    title: "Test Task",
    status: "New",
    progress: 0,
    display_order: 0,
    ...overrides,
  };
}

describe("TaskCalculationService (UNIT-FE-SVC-TASKCALC-001)", () => {
  describe("isHoliday", () => {
    it("should identify weekends as holidays", () => {
      expect(isHoliday(new Date("2024-01-07"), mockHolidayDef)).toBe(true); // Sunday
      expect(isHoliday(new Date("2024-01-05"), mockHolidayDef)).toBe(false); // Friday
    });

    it("should handle extra holidays", () => {
      expect(isHoliday(new Date("2024-01-01"), mockHolidayDef)).toBe(true);
    });

    it("should handle extra workdays", () => {
      expect(isHoliday(new Date("2024-01-06"), mockHolidayDef)).toBe(false); // Saturday but extra workday
    });
  });

  describe("addWorkingDays", () => {
    it("should calculate end date correctly for 1 day task", () => {
      const start = new Date("2024-01-02"); // Tuesday
      const result = addWorkingDays(start, 1, mockHolidayDef);
      expect(result.toISOString().split("T")[0]).toBe("2024-01-02");
    });

    it("should skip weekends", () => {
      const start = new Date("2024-01-05"); // Friday
      // 2 days task: Friday and Saturday (Saturday is extra workday in mock)
      const result = addWorkingDays(start, 2, mockHolidayDef);
      expect(result.toISOString().split("T")[0]).toBe("2024-01-06");
    });
  });

  describe("calculateScheduledTasks", () => {
    it("should calculate dates based on priority and dependencies", () => {
      const tasks: Task[] = [
        createTask({ id: "t1", title: "Task 1", planned_hours: 8 }), // 1 day
        createTask({
          id: "t2",
          title: "Task 2",
          planned_hours: 16,
          dependencies: ["t1"],
        }), // 2 days
      ];

      const result = calculateScheduledTasks(tasks, mockSettings);

      const t1 = result.find((t) => t.id === "t1")!;
      const t2 = result.find((t) => t.id === "t2")!;

      expect(t1.calculated_start_date).toBeDefined();
      expect(t2.calculated_start_date! >= t1.calculated_end_date!).toBe(true);
    });

    it("should handle start_fixed rule", () => {
      const tasks: Task[] = [
        createTask({
          id: "t1",
          scheduling_rule: "start_fixed",
          start_date: "2024-03-01",
          planned_hours: 16,
        }),
      ];

      const result = calculateScheduledTasks(tasks, mockSettings);
      const t1 = result.find((t) => t.id === "t1")!;

      expect(t1.calculated_start_date).toBe("2024-03-01");
      // 2024-03-01 is Friday. 2 days task -> Fri, Sat(H), Sun(H), Mon. So ends on 2024-03-04.
      expect(t1.calculated_end_date).toBe("2024-03-04");
    });

    it("should handle parent task aggregation", () => {
      const tasks: Task[] = [
        createTask({ id: "p1", title: "Parent" }),
        createTask({
          id: "c1",
          title: "Child 1",
          parent_id: "p1",
          scheduling_rule: "start_fixed",
          start_date: "2024-03-01",
          planned_hours: 8,
        }),
        createTask({
          id: "c2",
          title: "Child 2",
          parent_id: "p1",
          scheduling_rule: "start_fixed",
          start_date: "2024-03-04",
          planned_hours: 8,
        }),
      ];

      const result = calculateScheduledTasks(tasks, mockSettings);
      const p1 = result.find((t) => t.id === "p1")!;

      expect(p1.calculated_start_date).toBe("2024-03-01");
      expect(p1.calculated_end_date).toBe("2024-03-04");
    });

    it("should schedule tasks sequentially for the same assignee based on display_order", () => {
      const tasks: Task[] = [
        createTask({
          id: "t1",
          assignee_id: "user1",
          planned_hours: 8,
          display_order: 1,
        }),
        createTask({
          id: "t2",
          assignee_id: "user1",
          planned_hours: 16,
          display_order: 2,
        }),
      ];

      const result = calculateScheduledTasks(tasks, mockSettings);
      const t1 = result.find((t) => t.id === "t1")!;
      const t2 = result.find((t) => t.id === "t2")!;

      // t1 should start "today" (if today is work day)
      // t2 should start at least 1 working day after t1 ends (since t1 is 1 day task)
      expect(t1.calculated_start_date).toBeDefined();
      expect(t2.calculated_start_date! > t1.calculated_end_date!).toBe(true);
    });

    it("should handle circular dependencies without crashing", () => {
      const tasks: Task[] = [
        createTask({ id: "t1", dependencies: ["t2"] }),
        createTask({ id: "t2", dependencies: ["t1"] }),
      ];

      const result = calculateScheduledTasks(tasks, mockSettings);
      expect(result).toHaveLength(2);
      expect(result[0].calculated_start_date).toBeDefined();
    });
  });
});
