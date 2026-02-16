import { useState } from "react";
import { ApiClient } from "../../../infrastructure/api/client";

interface ProjectCreatePageProps {
  onProjectCreated: (projectName: string) => void;
}

export const ProjectCreatePage = ({
  onProjectCreated,
}: ProjectCreatePageProps) => {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await ApiClient.post("/projects/", { project_name: projectName });
      onProjectCreated(projectName);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create project");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f4f4f9",
        padding: "20px",
        fontFamily: "'Segoe UI', sans-serif",
        color: "#333",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "20px",
            fontSize: "24px",
            textAlign: "center",
            color: "#2c3e50",
          }}
        >
          新規プロジェクト作成
        </h1>
        <p
          style={{
            fontSize: "0.9em",
            color: "#7f8c8d",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          プロジェクト名を入力して開始してください。
          <br />
          Gitブランチが作成され、履歴管理が始まります。
        </p>
        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="project-name"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#555",
              }}
            >
              プロジェクト名
            </label>
            <input
              type="text"
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
              placeholder="例: 新製品開発プロジェクト"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "作成中..." : "プロジェクト作成開始"}
          </button>
        </form>
      </div>
    </div>
  );
};
