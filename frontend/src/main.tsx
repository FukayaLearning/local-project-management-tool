import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./index.css";
import {
  DependencyProvider,
  DependencyContextType,
} from "./application/providers/DependencyProvider.tsx";
import App from "./App.tsx";

// Infrastructure implementations
import { SettingsApiRepository } from "./infrastructure/api/repositories/settingsApiRepository";
import { TaskApiRepository } from "./infrastructure/api/repositories/taskApiRepository";
import { ProjectApiRepository } from "./infrastructure/api/repositories/projectApiRepository";

const theme = createTheme({
  /** Put your mantine theme override here */
});

// Dependency Registration (Composition Root)
const dependencies: DependencyContextType = {
  settingsRepository: new SettingsApiRepository(),
  taskRepository: new TaskApiRepository(),
  projectRepository: new ProjectApiRepository(),
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <DependencyProvider dependencies={dependencies}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DependencyProvider>
    </MantineProvider>
  </StrictMode>,
);
