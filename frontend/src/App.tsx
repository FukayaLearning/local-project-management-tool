import { useState, useEffect } from "react";
import { SettingsPage } from "./presentation/pages/SettingsPage";
import { TaskListPage } from "./presentation/pages/TaskListPage";
import { ProjectCreatePage } from "./presentation/pages/ProjectCreatePage";
import { MenuBar } from "./components/Layout/MenuBar";
import { ApiClient } from "./infrastructure/api/client";
import "./index.css";

interface SystemStatus {
  is_git_initialized: boolean;
  has_default_project: boolean;
  current_project: string | null;
}

function App() {
  const [currentPage, setCurrentPage] = useState<
    "tasks" | "settings" | "create_project" | "gantt"
  >("tasks");
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await ApiClient.get<SystemStatus>("/system/status");
        setSystemStatus(status);
        if (!status.is_git_initialized || !status.has_default_project) {
          setCurrentPage("create_project");
        } else {
          const projectList = await ApiClient.get<string[]>("/projects/");
          setProjects(projectList);
        }
      } catch (error) {
        console.error("Failed to fetch system status", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const handleProjectCreated = (projectName: string) => {
    setSystemStatus({
      is_git_initialized: true,
      has_default_project: true,
      current_project: projectName,
    });
    setProjects((prev: string[]) => [...prev, projectName]);
    setCurrentPage("tasks");
  };

  const handleSwitchProject = async (projectName: string) => {
    try {
      await ApiClient.post(`/projects/${projectName}/switch`, {});
      setSystemStatus((prev: SystemStatus | null) =>
        prev ? { ...prev, current_project: projectName } : prev,
      );
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

  if (
    currentPage === "create_project" &&
    (!systemStatus?.is_git_initialized || !systemStatus?.has_default_project)
  ) {
    return <ProjectCreatePage onProjectCreated={handleProjectCreated} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <MenuBar
        currentPage={currentPage}
        onNavigate={(page: string) =>
          setCurrentPage(
            page as "tasks" | "settings" | "create_project" | "gantt",
          )
        }
        currentProject={systemStatus?.current_project || null}
        projects={projects}
        onSwitchProject={handleSwitchProject}
      />
      <main className="py-10">
        {currentPage === "tasks" && <TaskListPage />}
        {currentPage === "settings" && <SettingsPage />}
        {currentPage === "gantt" && (
          <div className="text-center">Gantt Chart (Not Implemented)</div>
        )}
      </main>
    </div>
  );
}

export default App;
