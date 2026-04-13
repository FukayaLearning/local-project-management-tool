import React, { useState, useEffect } from "react";
import {
  ProjectSettings,
  BasicSettings,
  Assignee,
} from "../../../domain/entities/settings";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Card } from "../../components/Card";

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9);

interface ProjectSettingsFormProps {
  settings: ProjectSettings;
  onSave: (settings: Partial<ProjectSettings>) => Promise<void>;
  isLoading: boolean;
}

export const ProjectSettingsForm: React.FC<ProjectSettingsFormProps> = ({
  settings,
  onSave,
  isLoading,
}) => {
  const [projectName, setProjectName] = useState(settings.project_name || "");
  const [assignees, setAssignees] = useState<Assignee[]>(
    settings.basic_settings_override?.assignees || [],
  );
  const [newAssigneeName, setNewAssigneeName] = useState("");

  useEffect(() => {
    if (settings) {
      setProjectName(settings.project_name);
      setAssignees(settings.basic_settings_override?.assignees || []);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const basicOverride: Partial<BasicSettings> = {
      ...(settings.basic_settings_override || {}),
      assignees: assignees,
    };
    await onSave({
      project_name: projectName,
      basic_settings_override: basicOverride as BasicSettings,
    });
  };

  const addAssignee = () => {
    if (!newAssigneeName.trim()) return;
    const newAssignee: Assignee = {
      id: generateId(),
      name: newAssigneeName.trim(),
      productivity_ratio: 1.0,
      commitment_ratio: 1.0,
    };
    setAssignees([...assignees, newAssignee]);
    setNewAssigneeName("");
  };

  const updateAssigneeProductivity = (id: string, ratio: number) => {
    setAssignees(
      assignees.map((a) =>
        a.id === id ? { ...a, productivity_ratio: ratio } : a,
      ),
    );
  };

  const removeAssignee = (id: string) => {
    setAssignees(assignees.filter((a) => a.id !== id));
  };

  return (
    <Card title="Project Settings" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isLoading}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !projectName.trim()}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assignees</h3>
        <div className="flex gap-2 mb-4">
          <Input
            id="new-assignee-name"
            label=""
            placeholder="New Assignee Name"
            value={newAssigneeName}
            onChange={(e) => setNewAssigneeName(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex items-end pb-1">
            <Button
              type="button"
              variant="secondary"
              onClick={addAssignee}
              disabled={isLoading || !newAssigneeName.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        <ul className="space-y-2">
          {assignees.map((a) => (
            <li
              key={a.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {a.name}{" "}
                  <span className="text-xs text-gray-400">({a.id})</span>
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <label className="text-xs text-gray-500">Productivity:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={a.productivity_ratio}
                    onChange={(e) =>
                      updateAssigneeProductivity(a.id, Number(e.target.value))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAssignee(a.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
                disabled={isLoading}
              >
                Remove
              </button>
            </li>
          ))}
          {assignees.length === 0 && (
            <li className="text-sm text-gray-500 italic">
              No assignees added yet.
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
};
