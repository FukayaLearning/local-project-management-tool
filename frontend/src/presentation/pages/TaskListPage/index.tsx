import React, { useState, useEffect, useMemo } from "react";
import { useTaskUseCase } from "../../../application/usecases/useTaskUseCase";
import { useSettingsUseCase } from "../../../application/usecases/useSettingsUseCase";
import { TaskListView } from "./components/TaskListView";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { Button } from "../../components/Button";
import { Task, TaskCreate, TaskUpdate } from "../../../domain/entities/task";
import { flattenTasksWithHierarchy } from "../../../domain/services/ganttChartService";

interface TaskListPageProps {
  projectName: string;
}

export const TaskListPage: React.FC<TaskListPageProps> = ({ projectName }) => {
  const {
    globalSettings,
    projectSettings,
    fetchGlobalSettings,
    fetchProjectSettings,
  } = useSettingsUseCase();
  const {
    tasks,
    scheduledTasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    exportTasks,
  } = useTaskUseCase(
    projectSettings?.basic_settings_override || globalSettings,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  useEffect(() => {
    fetchGlobalSettings();
    fetchProjectSettings(projectName);
    fetchTasks(projectName);
  }, [fetchGlobalSettings, fetchProjectSettings, fetchTasks, projectName]);

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSave = async (data: TaskCreate | TaskUpdate) => {
    if (editingTask) {
      await updateTask(projectName, editingTask.id, data as TaskUpdate);
    } else {
      await createTask(projectName, data as TaskCreate);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(projectName, id);
    }
  };

  const handleReorder = (orders: { id: string; display_order: number }[]) => {
    reorderTasks(projectName, orders);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">Loading tasks...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">Error: {error.message}</div>
    );
  }

  const filteredTasks = useMemo(() => {
    let result = [...scheduledTasks];
    if (searchTerm) {
      result = result.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        result = result.filter((t) => !t.assignee_id);
      } else {
        result = result.filter((t) => t.assignee_id === assigneeFilter);
      }
    }

    // Apply hierarchy if not searching/filtering (or even if filtering, depending on UX choice)
    // For simplicity, we use hierarchy when not filtering by text/status/assignee to keep D&D logic simple
    const isFiltering =
      searchTerm !== "" || statusFilter !== "all" || assigneeFilter !== "all";
    if (!isFiltering) {
      return flattenTasksWithHierarchy(result);
    }
    return result;
  }, [scheduledTasks, searchTerm, statusFilter, assigneeFilter]);

  const isReorderable =
    searchTerm === "" && statusFilter === "all" && assigneeFilter === "all";

  const assignees =
    projectSettings?.basic_settings_override?.assignees ||
    globalSettings?.assignees ||
    [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Task List</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            id="status-filter"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Doing">Doing</option>
            <option value="Done">Done</option>
          </select>
          <select
            id="assignee-filter"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => exportTasks(projectName)}>
            Download CSV
          </Button>
          <Button onClick={handleCreateClick}>+ New Task</Button>
        </div>
      </div>

      <TaskListView
        tasks={filteredTasks}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onReorder={handleReorder}
        isReorderable={isReorderable}
      />

      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        tasks={scheduledTasks}
        onSave={handleSave}
        assignees={
          projectSettings?.basic_settings_override?.assignees ||
          globalSettings?.assignees ||
          []
        }
      />
    </div>
  );
};
