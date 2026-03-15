import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SettingsPage } from "./presentation/pages/SettingsPage";
import { TaskListPage } from "./presentation/pages/TaskListPage";
import { ProjectCreatePage } from "./presentation/pages/ProjectCreatePage";
import { GanttChartPage } from "./presentation/pages/GanttChartPage";
import { MenuBar } from "./presentation/components/Layout/MenuBar";
import { useSystemUseCase } from "./application/usecases/useSystemUseCase";
import "./index.css";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    systemStatus,
    projects,
    isLoading: isSystemLoading,
    fetchSystemStatus,
    fetchProjects,
    switchProject,
    createProject,
  } = useSystemUseCase();

  useEffect(() => {
    const init = async () => {
      try {
        const status = await fetchSystemStatus();

        if (!status.is_git_initialized || !status.has_default_project) {
          if (location.pathname !== "/create_project") {
            navigate("/create_project");
          }
        } else {
          await fetchProjects();
          // Only redirect to tasks if we are at root
          if (location.pathname === "/") {
            navigate("/tasks");
          }
        }
      } catch (error) {
        console.error("Failed to initialize app", error);
      }
    };
    init();
  }, [navigate, fetchSystemStatus, fetchProjects]);

  // Helper to determine active tab based on path
  const getCurrentPage = () => {
    if (location.pathname.startsWith("/tasks")) return "tasks";
    if (location.pathname.startsWith("/settings")) return "settings";
    if (location.pathname.startsWith("/gantt")) return "gantt";
    if (location.pathname.startsWith("/create_project"))
      return "create_project";
    return "tasks";
  };

  const handleNavigate = (page: string) => {
    if (page === "tasks") navigate("/tasks");
    if (page === "settings") navigate("/settings");
    if (page === "gantt") navigate("/gantt");
    if (page === "create_project") navigate("/create_project");
  };

  const handleProjectCreated = async (projectName: string) => {
    try {
      await createProject(projectName);
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const handleSwitchProject = async (projectName: string) => {
    try {
      await switchProject(projectName);
      // Reload or re-fetch tasks might be needed, but for now just stay on current page
      // largely the backend state changes
      window.location.reload(); // Full browser reload to re-fetch all data for the new project
    } catch (error) {
      console.error("Failed to switch project", error);
    }
  };

  if (isSystemLoading && !systemStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // If on create_project, show full page without standard layout?
  // Design says MenuBar includes links, but checking implementation of ProjectCreatePage
  // it seems to be a standalone page in the code we saw earlier.
  // We will keep it simple.

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Show MenuBar unless on create_project which might act as initial setup */}
      {location.pathname !== "/create_project" && (
        <MenuBar
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          currentProject={systemStatus?.current_project || null}
          projects={projects}
          onSwitchProject={handleSwitchProject}
        />
      )}

      <main className={location.pathname !== "/create_project" ? "py-10" : ""}>
        <Routes>
          <Route
            path="/create_project"
            element={
              <ProjectCreatePage onProjectCreated={handleProjectCreated} />
            }
          />
          <Route path="/tasks" element={<TaskListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/gantt" element={<GanttChartPage />} />
          <Route path="/" element={<div>Scanning...</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
