import React, { useEffect } from "react";
import { useSettingsUseCase } from "../../../application/usecases/useSettingsUseCase";
import { ProjectSettingsForm } from "./ProjectSettingsForm";
import { Card } from "../../components/Card";

export const SettingsPage: React.FC = () => {
  const { settings, isLoading, error, fetchSettings, updateProjectSettings } =
    useSettingsUseCase();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading && !settings) {
    return (
      <div className="p-8 text-center text-gray-500">Loading settings...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">Error: {error.message}</div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center text-gray-500">No settings found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <ProjectSettingsForm
        settings={settings.project}
        onSave={async (newSettings) => {
          await updateProjectSettings(newSettings);
        }}
        isLoading={isLoading}
      />

      <Card title="Basic Settings (Read Only)" className="mb-6 opacity-75">
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <strong>Daily Work Hours:</strong> {settings.basic.daily_work_hours}{" "}
            hours
          </p>
          <p>
            <strong>Task Statuses:</strong>{" "}
            {settings.basic.task_statuses.map((s) => s.name).join(", ")}
          </p>
          <p>
            <strong>Holidays:</strong>{" "}
            {settings.basic.holiday_definition.weekend_days.length > 0
              ? "Weekends defined"
              : "No weekends"}
          </p>
          <p className="italic text-xs">
            Note: Basic settings editing is not yet implemented.
          </p>
        </div>
      </Card>
    </div>
  );
};
