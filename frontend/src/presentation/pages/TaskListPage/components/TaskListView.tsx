import React, { useState, useEffect } from "react";
import { Task } from "../../../../domain/entities/task";
import { Button } from "../../../components/Button";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder?: (orders: { id: string; display_order: number }[]) => void;
  isReorderable?: boolean;
}

const SortableTaskRow = ({
  task,
  onEdit,
  onDelete,
  isReorderable,
}: {
  task: Task;
  onEdit: any;
  onDelete: any;
  isReorderable: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isReorderable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    boxShadow: isDragging ? "0 5px 15px rgba(0,0,0,0.15)" : "none",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`task-item hover:bg-gray-50 ${isDragging ? "bg-white" : ""}`}
    >
      {isReorderable ? (
        <td
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-grab"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </td>
      ) : (
        <td className="w-10 px-6 py-4"></td>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {task.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            task.status === "Done"
              ? "bg-green-100 text-green-800"
              : task.status === "New"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {task.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {task.assignee_id || "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Button size="sm" variant="secondary" onClick={() => onEdit(task)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </td>
    </tr>
  );
};

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onEdit,
  onDelete,
  onReorder,
  isReorderable = true,
}) => {
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    // Sort tasks by display_order
    const sorted = [...tasks].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0),
    );
    setLocalTasks(sorted);
  }, [tasks]);

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

    if (active.id !== over?.id && isReorderable) {
      setLocalTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        if (onReorder) {
          const orders = newItems.map((item, index) => ({
            id: item.id,
            display_order: index,
          }));
          onReorder(orders);
        }

        return newItems;
      });
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found. Create one!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-6 py-3"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assignee
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <tbody className="divide-y divide-gray-200">
            <SortableContext
              items={localTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {localTasks.map((task) => (
                <SortableTaskRow
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isReorderable={isReorderable}
                />
              ))}
            </SortableContext>
          </tbody>
        </DndContext>
      </table>
    </div>
  );
};
