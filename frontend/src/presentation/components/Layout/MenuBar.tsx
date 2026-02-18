import { ApiClient } from "../../../infrastructure/api/client";

interface MenuBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentProject: string | null;
  projects: string[];
  onSwitchProject: (projectName: string) => void;
}

export const MenuBar = ({
  currentPage,
  onNavigate,
  currentProject,
  projects,
  onSwitchProject,
}: MenuBarProps) => {
  const handleUndo = async () => {
    try {
      await ApiClient.post("/tasks/undo", {});
      alert("Undo successful");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Undo failed");
    }
  };

  const handleRedo = async () => {
    try {
      await ApiClient.post("/tasks/redo", {});
      alert("Redo successful");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Redo failed");
    }
  };

  const navButtonClass = (page: string) => {
    const base =
      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
    return currentPage === page
      ? `${base} border-blue-500 text-gray-900`
      : `${base} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => onNavigate("tasks")}
                className="font-bold text-xl text-blue-600"
              >
                Local PM
              </button>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => onNavigate("tasks")}
                className={navButtonClass("tasks")}
              >
                Tasks
              </button>
              <button
                onClick={() => onNavigate("gantt")}
                className={navButtonClass("gantt")}
              >
                Gantt Chart
              </button>
              <button
                onClick={() => onNavigate("settings")}
                className={navButtonClass("settings")}
              >
                Settings
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={currentProject || ""}
              onChange={(e) => onSwitchProject(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="" disabled>
                Select Project
              </option>
              {projects.map((p: string) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={handleUndo}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
            >
              Redo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
