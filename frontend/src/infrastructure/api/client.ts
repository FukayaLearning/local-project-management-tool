const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  static async getSystemStatus(): Promise<any> {
    return this.get<any>("/system/status");
  }

  static async createProject(name: string): Promise<any> {
    return this.post<any>("/projects/", { project_name: name });
  }

  static async ensureSystemInitialized(): Promise<void> {
    try {
      const status = await this.getSystemStatus();
      if (!status.is_git_initialized || !status.has_default_project) {
        console.log(
          "System not initialized or no default project. Creating Default Project...",
        );
        // The backend handles initialization if needed when creating a project
        try {
          await this.createProject("Default Project");
        } catch (e: any) {
          // Ignore if project already exists (e.g. from previous run)
          console.log("Project creation info:", e.message);
        }
      }
    } catch (error) {
      console.error("Failed to ensure system initialization:", error);
      // Don't throw, let the test fail naturally if setup failed, to see logs
    }
  }
}
