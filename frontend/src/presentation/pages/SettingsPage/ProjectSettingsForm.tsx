import React, { useState, useEffect } from 'react';
import { ProjectSettings } from '../../../../domain/entities/settings';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';

interface ProjectSettingsFormProps {
    settings: ProjectSettings;
    onSave: (settings: Partial<ProjectSettings>) => Promise<void>;
    isLoading: boolean;
}

export const ProjectSettingsForm: React.FC<ProjectSettingsFormProps> = ({ settings, onSave, isLoading }) => {
    const [projectName, setProjectName] = useState(settings.project_name || '');

    useEffect(() => {
        if (settings) {
            setProjectName(settings.project_name);
        }
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({ project_name: projectName });
    };

    return (
        <Card title="Project Settings" className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={isLoading}
                    required
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading || !projectName.trim()}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
