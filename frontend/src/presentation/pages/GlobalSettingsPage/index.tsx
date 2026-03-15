import React, { useEffect } from "react";
import { useSettingsUseCase } from "../../../application/usecases/useSettingsUseCase";
import { Card } from "../../components/Card";

export const GlobalSettingsPage: React.FC = () => {
  const { globalSettings, isLoading, error, fetchGlobalSettings } =
    useSettingsUseCase();

  useEffect(() => {
    fetchGlobalSettings();
  }, [fetchGlobalSettings]);

  if (isLoading && !globalSettings) {
    return (
      <div className="p-8 text-center text-gray-500">Loading settings...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">Error: {error.message}</div>
    );
  }

  if (!globalSettings) {
    return (
      <div className="p-8 text-center text-gray-500">No settings found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Basic Settings</h1>

      <Card title="Basic Settings" className="mb-6">
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            <strong>Daily Work Hours:</strong> {globalSettings.daily_work_hours}{" "}
            hours
          </p>
          <p>
            <strong>Task Statuses:</strong>{" "}
            {globalSettings.task_statuses.map((s) => s.name).join(", ")}
          </p>
          <p>
            <strong>Task Types:</strong>{" "}
            {globalSettings.task_types.map((t) => t.name).join(", ")}
          </p>
          <p>
            <strong>Holidays:</strong>{" "}
            {globalSettings.holiday_definition.weekend_days.length > 0
              ? "Weekends defined"
              : "No weekends"}
          </p>
          <p className="italic text-xs">
            Note: Full editing of basic settings is not yet implemented.
          </p>
        </div>
      </Card>
    </div>
  );
};
