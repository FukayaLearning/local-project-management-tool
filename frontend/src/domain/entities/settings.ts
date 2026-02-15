export interface TaskStatus {
    id: string;
    name: string;
    is_completed_state: boolean;
}

export interface TaskType {
    id: string;
    name: string;
}

export interface Assignee {
    id: string;
    name: string;
    productivity_ratio: number;
    commitment_ratio: number;
}

export interface HolidayDefinition {
    holiday_csv_url: string;
    weekend_days: number[];
    extra_holidays: string[];
    extra_workdays: string[];
}

export interface BasicSettings {
    task_statuses: TaskStatus[];
    task_types: TaskType[];
    assignees: Assignee[];
    daily_work_hours: number;
    holiday_definition: HolidayDefinition;
}

export interface ProjectSettings {
    project_name: string;
    basic_settings_override?: BasicSettings;
}

export interface Settings {
    basic: BasicSettings;
    project: ProjectSettings;
}
