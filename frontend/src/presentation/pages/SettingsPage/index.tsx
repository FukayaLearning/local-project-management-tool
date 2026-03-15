import React, { useEffect } from "react";
import { useSettingsUseCase } from "../../../application/usecases/useSettingsUseCase";
import { ProjectSettingsForm } from "./ProjectSettingsForm";
import { Card } from "../../components/Card";

interface SettingsPageProps {
  projectName: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ projectName }) => {
  const {
    projectSettings,
    globalSettings,
    isLoading,
    error,
    fetchProjectSettings,
    updateProjectSettings,
    fetchGlobalSettings,
  } = useSettingsUseCase();

  useEffect(() => {
    fetchProjectSettings(projectName);
    fetchGlobalSettings();
  }, [fetchProjectSettings, fetchGlobalSettings, projectName]);

  if (isLoading && !projectSettings) {
    return (
      <div className="p-8 text-center text-gray-500">Loading settings...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">Error: {error.message}</div>
    );
  }

  if (!projectSettings) {
    return (
      <div className="p-8 text-center text-gray-500">No settings found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Project Settings
      </h1>

      <ProjectSettingsForm
        settings={projectSettings}
        onSave={async (newSettings) => {
          await updateProjectSettings(projectName, newSettings);
        }}
        isLoading={isLoading}
      />

      {globalSettings && (
        <Card title="Basic Settings (Inherited)" className="mb-6 opacity-75">
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong>Daily Work Hours:</strong>{" "}
              {globalSettings.daily_work_hours} hours
            </p>
            <p>
              <strong>Task Statuses:</strong>{" "}
              {globalSettings.task_statuses.map((s) => s.name).join(", ")}
            </p>
            <p>
              <strong>Holidays:</strong>{" "}
              {globalSettings.holiday_definition.weekend_days.length > 0
                ? "Weekends defined"
                : "No weekends"}
            </p>
            <p className="italic text-xs">
              These settings are inherited from Basic Settings and can be
              overridden per project.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
