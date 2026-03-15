import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectUseCase } from "../../../application/usecases/useProjectUseCase";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

export const ProjectManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects, createProject } =
    useProjectUseCase();
  const [newProjectName, setNewProjectName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenProject = (projectName: string) => {
    navigate(`/projects/${encodeURIComponent(projectName)}`);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      await createProject(newProjectName.trim());
      setNewProjectName("");
      handleOpenProject(newProjectName.trim());
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setIsCreating(false);
    }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Projects</h1>
          <p className="text-gray-500 text-sm">
            Create or manage your local projects
          </p>
        </div>
        <form
          onSubmit={handleCreateProject}
          className="flex gap-2 w-full md:w-auto"
        >
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name..."
            className="flex-grow md:w-64"
            disabled={isCreating}
            required
          />
          <Button type="submit" disabled={isCreating || !newProjectName.trim()}>
            {isCreating ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-2">No projects yet.</p>
          <p className="text-sm text-gray-400">
            Enter a name above to create your first project!
          </p>
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
