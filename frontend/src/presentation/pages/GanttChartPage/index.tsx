import React, { useEffect, useState } from "react";
import { useTaskUseCase } from "../../../application/usecases/useTaskUseCase";
import { useSettingsUseCase } from "../../../application/usecases/useSettingsUseCase";
import { GanttChart } from "./components/GanttChart";

const DEFAULT_DAY_WIDTH = 40;
const MIN_DAY_WIDTH = 20;
const MAX_DAY_WIDTH = 80;
const ROW_HEIGHT = 36;
const ZOOM_STEP = 10;

interface GanttChartPageProps {
  projectName: string;
}

export const GanttChartPage: React.FC<GanttChartPageProps> = ({
  projectName,
}) => {
  const { globalSettings, fetchGlobalSettings } = useSettingsUseCase();
  const {
    scheduledTasks,
    tasks,
    isLoading,
    error,
    fetchTasks,
    reorderTasks,
    applySchedule,
  } = useTaskUseCase(globalSettings);
  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const [showInazumaLine, setShowInazumaLine] = useState(false);
  const [referenceDate, setReferenceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    fetchGlobalSettings();
    fetchTasks(projectName);
  }, [fetchGlobalSettings, fetchTasks, projectName]);

  const handleZoomIn = () => {
    setDayWidth((prev) => Math.min(prev + ZOOM_STEP, MAX_DAY_WIDTH));
  };

  const handleZoomOut = () => {
    setDayWidth((prev) => Math.max(prev - ZOOM_STEP, MIN_DAY_WIDTH));
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

  return (
    <div className="max-w-full mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gantt Chart</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            disabled={dayWidth <= MIN_DAY_WIDTH}
          >
            Zoom Out
          </button>
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            disabled={dayWidth >= MAX_DAY_WIDTH}
          >
            Zoom In
          </button>
          <button
            onClick={() => applySchedule(projectName)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            title="Update all task start/due dates based on current schedule"
          >
            Apply Schedule to CSV
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showInazumaLine}
              onChange={(e) => setShowInazumaLine(e.target.checked)}
              className="rounded"
            />
            Show Progress Line
          </label>
          {showInazumaLine && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Reference Date:</label>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <GanttChart
        tasks={scheduledTasks}
        dayWidth={dayWidth}
        rowHeight={ROW_HEIGHT}
        showInazumaLine={showInazumaLine}
        referenceDate={referenceDate}
        onReorder={handleReorder}
      />
    </div>
  );
};
