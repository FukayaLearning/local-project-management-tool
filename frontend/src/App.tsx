import { useEffect } from "react";
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
import { ProjectCreatePage } from "./presentation/pages/ProjectCreatePage";
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

  const decodedProjectName = decodeURIComponent(projectName);

  const getCurrentPage = () => {
    if (location.pathname.includes("/gantts")) return "gantt";
    if (location.pathname.includes("/settings")) return "project_settings";
    return "tasks";
  };

  const handleNavigate = (page: string) => {
    const encoded = encodeURIComponent(decodedProjectName);
    if (page === "tasks") navigate(`/projects/${encoded}`);
    if (page === "gantt") navigate(`/projects/${encoded}/gantts`);
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
            path="/gantts"
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

function GlobalLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPage = () => {
    if (location.pathname === "/settings") return "global_settings";
    return "projects";
  };

  const handleNavigate = (page: string) => {
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
      <main className="py-10">
        <Routes>
          <Route path="/projects" element={<ProjectManagementPage />} />
          <Route path="/settings" element={<GlobalSettingsPage />} />
          <Route
            path="/projects/new"
            element={
              <ProjectCreatePage
                onProjectCreated={async (name) => {
                  navigate(`/projects/${encodeURIComponent(name)}`);
                }}
              />
            }
          />
          <Route path="/" element={<Navigate to="/projects" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/projects/:projectName/*" element={<ProjectLayout />} />
      <Route path="/*" element={<GlobalLayout />} />
    </Routes>
  );
}

export default App;
