import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SettingsPage } from "./presentation/pages/SettingsPage";
import { TaskListPage } from "./presentation/pages/TaskListPage";
import { ProjectCreatePage } from "./presentation/pages/ProjectCreatePage";
import { MenuBar } from "./presentation/components/Layout/MenuBar";
import { ApiClient } from "./infrastructure/api/client";
import "./index.css";

interface SystemStatus {
  is_git_initialized: boolean;
  has_default_project: boolean;
  current_project: string | null;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await ApiClient.get<SystemStatus>("/system/status");
        setSystemStatus(status);

        if (!status.is_git_initialized || !status.has_default_project) {
          if (location.pathname !== "/create_project") {
            navigate("/create_project");
          }
        } else {
          const projectList = await ApiClient.get<string[]>("/projects/");
          setProjects(projectList);
          // Only redirect to tasks if we are at root
          if (location.pathname === "/") {
            navigate("/tasks");
          }
        }
      } catch (error) {
        console.error("Failed to fetch system status", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [navigate]); // Added navigate to dependency

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

  const handleProjectCreated = (projectName: string) => {
    setSystemStatus({
      is_git_initialized: true,
      has_default_project: true,
      current_project: projectName,
    });
    setProjects((prev: string[]) => [...prev, projectName]);
    navigate("/tasks");
  };

  const handleSwitchProject = async (projectName: string) => {
    try {
      await ApiClient.post(`/projects/${projectName}/switch`, {});
      setSystemStatus((prev: SystemStatus | null) =>
        prev ? { ...prev, current_project: projectName } : prev,
      );
      // Reload or re-fetch tasks might be needed, but for now just stay on current page
      // largely the backend state changes
      navigate(0); // Refresh to load new project data
    } catch (error) {
      console.error("Failed to switch project", error);
    }
  };

  if (isLoading) {
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
          <Route
            path="/gantt"
            element={
              <div className="text-center">Gantt Chart (Not Implemented)</div>
            }
          />
          <Route path="/" element={<div>Scanning...</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
