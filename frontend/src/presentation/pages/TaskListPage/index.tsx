import React, { useEffect, useState } from "react";
import { useTaskUseCase } from "../../../application/usecases/useTaskUseCase";
import { TaskListView } from "./components/TaskListView";
import { TaskDetailModal } from "./components/TaskDetailModal";
import { Button } from "../../components/Button";
import { Task, TaskCreate, TaskUpdate } from "../../../domain/entities/task";

export const TaskListPage: React.FC = () => {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useTaskUseCase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
      await updateTask(editingTask.id, data as TaskUpdate);
    } else {
      await createTask(data as TaskCreate);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task List</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleCreateClick}>+ New Task</Button>
        </div>
      </div>

      <TaskListView
        tasks={tasks.filter((task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onReorder={reorderTasks}
        isReorderable={searchTerm === ""}
      />

      <TaskDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSave={handleSave}
      />
    </div>
  );
};
