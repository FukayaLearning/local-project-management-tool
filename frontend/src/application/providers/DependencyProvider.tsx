import React, { createContext, useContext, ReactNode } from "react";
import { ISettingsRepository } from "../../domain/repositories/settingsRepository";
import { ITaskRepository } from "../../domain/repositories/taskRepository";
import { ISystemRepository } from "../../domain/repositories/systemRepository";

export interface DependencyContextType {
  settingsRepository: ISettingsRepository;
  taskRepository: ITaskRepository;
  systemRepository: ISystemRepository;
}

const DependencyContext = createContext<DependencyContextType | null>(null);

interface DependencyProviderProps {
  children: ReactNode;
  dependencies: DependencyContextType;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({
  children,
  dependencies,
}) => {
  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error("useDependencies must be used within a DependencyProvider");
  }
  return context;
};
