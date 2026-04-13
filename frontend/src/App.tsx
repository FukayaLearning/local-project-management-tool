import React, { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import { SettingsPage } from "./presentation/pages/SettingsPage";
import { TaskListPage } from "./presentation/pages/TaskListPage";

import { GanttChartPage } from "./presentation/pages/GanttChartPage";
import { GlobalSettingsPage } from "./presentation/pages/GlobalSettingsPage";
import { ProjectManagementPage } from "./presentation/pages/ProjectManagementPage";
import { MenuBar } from "./presentation/components/Layout/MenuBar";
import { useProjectUseCase } from "./application/usecases/useProjectUseCase";
import "./index.css";

function ProjectLayout() {
  const { projectName } = useParams<{ projectName: string }>();
  const { projects, fetchProjects, undo, redo } = useProjectUseCase();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (!projectName) {
    return <Navigate to="/projects" replace />;
  }

  // useParams already provides decoded parameters, no need to decode again.
  const decodedProjectName = projectName;

  const getCurrentPage = () => {
    if (location.pathname.includes("/gantt")) return "gantt";
    if (location.pathname.includes("/settings")) return "project_settings";
    return "tasks";
  };

  const handleNavigate = (page: string) => {
    const isDebug = import.meta.env.VITE_DEBUG_MODE === "true";
    if (isDebug) console.log(`--- DEBUG USER ACTION --- Navigation: ${page}`);
    const encoded = encodeURIComponent(decodedProjectName);
    if (page === "tasks") navigate(`/projects/${encoded}`);
    if (page === "gantt") navigate(`/projects/${encoded}/gantt`);
    if (page === "project_settings") navigate(`/projects/${encoded}/settings`);
    if (page === "projects") navigate("/projects");
  };

  const handleSwitchProject = (newProject: string) => {
    const encoded = encodeURIComponent(newProject);
    navigate(`/projects/${encoded}`);
  };

  const handleUndo = async () => {
    try {
      await undo(decodedProjectName);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Undo failed");
    }
  };

  const handleRedo = async () => {
    try {
      await redo(decodedProjectName);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Redo failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <MenuBar
        context="project"
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
        currentProject={decodedProjectName}
        projects={projects}
        onSwitchProject={handleSwitchProject}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <main className="py-10">
        <Routes>
          <Route
            path="/"
            element={<TaskListPage projectName={decodedProjectName} />}
          />
          <Route
            path="/gantt"
            element={<GanttChartPage projectName={decodedProjectName} />}
          />
          <Route
            path="/settings"
            element={<SettingsPage projectName={decodedProjectName} />}
          />
        </Routes>
      </main>
    </div>
  );
}

function GlobalLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPage = () => {
    if (location.pathname === "/settings") return "global_settings";
    return "projects";
  };

  const handleNavigate = (page: string) => {
    const isDebug = import.meta.env.VITE_DEBUG_MODE === "true";
    if (isDebug)
      console.log(`--- DEBUG USER ACTION --- Global Navigation: ${page}`);
    if (page === "projects") navigate("/projects");
    if (page === "global_settings") navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <MenuBar
        context="global"
        currentPage={getCurrentPage()}
        onNavigate={handleNavigate}
      />
      <main className="py-10">{children}</main>
    </div>
  );
}

function App() {
  const location = useLocation();
  console.log("App current path:", location.pathname);
  return (
    <Routes>
      <Route
        path="/projects/new"
        element={
          <GlobalLayout>
            <ProjectManagementPage />
          </GlobalLayout>
        }
      />
      <Route path="/projects/:projectName/*" element={<ProjectLayout />} />
      <Route
        path="/projects"
        element={
          <GlobalLayout>
            <ProjectManagementPage />
          </GlobalLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <GlobalLayout>
            <GlobalSettingsPage />
          </GlobalLayout>
        }
      />
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
