import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectUseCase } from "../../../application/usecases/useProjectUseCase";
import { Button } from "../../components/Button";

export const ProjectManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects } = useProjectUseCase();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenProject = (projectName: string) => {
    navigate(`/projects/${encodeURIComponent(projectName)}`);
  };

  const handleCreateProject = () => {
    navigate("/projects/new");
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">Loading projects...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">Error: {error.message}</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
        <Button onClick={handleCreateProject}>+ New Project</Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No projects found.</p>
          <Button onClick={handleCreateProject}>
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenProject(project)}
            >
              <div>
                <h2 className="text-lg font-medium text-gray-900">{project}</h2>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenProject(project);
                }}
              >
                Open
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
