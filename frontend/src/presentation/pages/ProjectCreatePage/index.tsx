import React, { useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

interface ProjectCreatePageProps {
  onProjectCreated: (projectName: string) => Promise<void>;
}

export const ProjectCreatePage: React.FC<ProjectCreatePageProps> = ({
  onProjectCreated,
}) => {
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    setIsCreating(true);
    setErrorMessage(null);
    try {
      await onProjectCreated(trimmedName);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        新規プロジェクト作成
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label="プロジェクト名"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isCreating}
          required
        />
        {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
        <Button type="submit" disabled={isCreating || !projectName.trim()}>
          {isCreating ? "作成中..." : "プロジェクト作成開始"}
        </Button>
      </form>
    </div>
  );
};
