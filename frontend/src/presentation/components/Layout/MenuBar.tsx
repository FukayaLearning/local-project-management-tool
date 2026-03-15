interface GlobalMenuBarProps {
  context: "global";
  currentPage: string;
  onNavigate: (page: string) => void;
  currentProject?: never;
  projects?: never;
  onSwitchProject?: never;
  onUndo?: never;
  onRedo?: never;
}

interface ProjectMenuBarProps {
  context: "project";
  currentPage: string;
  onNavigate: (page: string) => void;
  currentProject: string;
  projects: string[];
  onSwitchProject: (projectName: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}

type MenuBarProps = GlobalMenuBarProps | ProjectMenuBarProps;

export const MenuBar = (props: MenuBarProps) => {
  const { context, currentPage, onNavigate } = props;

  const navButtonClass = (page: string) => {
    const base =
      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
    return currentPage === page
      ? `${base} border-blue-500 text-gray-900`
      : `${base} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`;
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => onNavigate("projects")}
                className="font-bold text-xl text-blue-600"
              >
                Local PM
              </button>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {context === "global" ? (
                <>
                  <button
                    onClick={() => onNavigate("projects")}
                    className={navButtonClass("projects")}
                  >
                    Project Management
                  </button>
                  <button
                    onClick={() => onNavigate("global_settings")}
                    className={navButtonClass("global_settings")}
                  >
                    Basic Settings
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate("projects")}
                    className={navButtonClass("projects")}
                  >
                    Project Management
                  </button>
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
                    onClick={() => onNavigate("project_settings")}
                    className={navButtonClass("project_settings")}
                  >
                    Project Settings
                  </button>
                </>
              )}
            </div>
          </div>
          {context === "project" && (
            <div className="flex items-center space-x-4">
              <select
                value={props.currentProject}
                onChange={(e) => props.onSwitchProject(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {props.projects.map((p: string) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={props.onUndo}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
              >
                Undo
              </button>
              <button
                onClick={props.onRedo}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
              >
                Redo
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
