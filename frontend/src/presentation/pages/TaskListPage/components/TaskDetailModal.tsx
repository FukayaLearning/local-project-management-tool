import React, { useState, useEffect } from "react";
import {
  Task,
  TaskCreate,
  TaskUpdate,
  SchedulingRule,
} from "../../../../domain/entities/task";
import { Modal } from "../../../../presentation/components/Modal";
import { Input } from "../../../../presentation/components/Input";
import { Select } from "../../../../presentation/components/Select";
import { Button } from "../../../../presentation/components/Button";

import { Assignee } from "../../../../types";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  tasks: Task[];
  onSave: (task: TaskCreate | TaskUpdate) => Promise<void>;
  assignees: Assignee[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  tasks,
  onSave,
  assignees,
}) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("New");
  const [plannedHours, setPlannedHours] = useState<number>(0);
  const [schedulingRule, setSchedulingRule] =
    useState<SchedulingRule>("priority");
  const [dependencies, setDependencies] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [parentId, setParentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setStatus(task.status);
        setPlannedHours(task.planned_hours || 0);
        setSchedulingRule(task.scheduling_rule || "priority");
        setDependencies(task.dependencies?.join(", ") || "");
        setStartDate(task.start_date || "");
        setDueDate(task.due_date || "");
        setAssigneeId(task.assignee_id || "");
        setParentId(task.parent_id || "");
      } else {
        setTitle("");
        setStatus("New");
        setPlannedHours(0);
        setSchedulingRule("priority");
        setDependencies("");
        setStartDate("");
        setDueDate("");
        setAssigneeId("");
        setParentId("");
      }
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const depArray = dependencies
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      await onSave({
        ...(task ? { id: task.id } : {}),
        title,
        status,
        progress: task ? task.progress : 0,
        planned_hours: plannedHours,
        scheduling_rule: schedulingRule,
        dependencies: depArray,
        start_date:
          schedulingRule === "start_fixed"
            ? startDate
            : task?.start_date || null,
        due_date:
          schedulingRule === "end_fixed" ? dueDate : task?.due_date || null,
        parent_id: parentId || null,
        assignee_id: assigneeId || null,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "New Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="task-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="task-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "New", label: "New" },
              { value: "Design", label: "Design" },
              { value: "Implementation", label: "Implementation" },
              { value: "Review", label: "Review" },
              { value: "Done", label: "Done" },
            ]}
            disabled={isLoading}
          />
          <Input
            id="task-planned-hours"
            label="Planned Hours"
            type="number"
            value={plannedHours}
            onChange={(e) => setPlannedHours(Number(e.target.value))}
            disabled={isLoading}
          />
        </div>

        <Select
          id="task-assignee"
          label="Assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          options={[
            { value: "", label: "Unassigned" },
            ...assignees.map((a) => ({ value: a.id, label: a.name })),
          ]}
          disabled={isLoading}
        />

        <Select
          id="task-parent"
          label="Parent Task"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          options={[
            { value: "", label: "No Parent" },
            ...tasks
              .filter((t) => !task || t.id !== task.id) // Avoid self-parenting
              .map((t) => ({ value: t.id, label: t.title })),
          ]}
          disabled={isLoading}
        />

        <Select
          id="task-scheduling-rule"
          label="Scheduling Rule"
          value={schedulingRule}
          onChange={(e) => setSchedulingRule(e.target.value as SchedulingRule)}
          options={[
            { value: "priority", label: "Priority Based" },
            { value: "start_fixed", label: "Start Fixed" },
            { value: "end_fixed", label: "End Fixed" },
          ]}
          disabled={isLoading}
        />

        <Input
          id="task-dependencies"
          label="Dependencies (Task IDs, comma separated)"
          value={dependencies}
          onChange={(e) => setDependencies(e.target.value)}
          disabled={isLoading}
          placeholder="e.g. uuid-1, uuid-2"
        />

        {schedulingRule === "start_fixed" && (
          <Input
            id="task-start-date"
            label="Fixed Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isLoading}
          />
        )}

        {schedulingRule === "end_fixed" && (
          <Input
            id="task-due-date"
            label="Fixed End Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !title.trim()}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
