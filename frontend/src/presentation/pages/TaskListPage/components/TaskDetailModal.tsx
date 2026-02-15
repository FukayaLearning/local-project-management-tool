import React, { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate } from '../../../../domain/entities/task';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: Task | null;
    onSave: (task: TaskCreate | TaskUpdate) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, onSave }) => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('New');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setTitle(task.title);
                setStatus(task.status);
            } else {
                setTitle('');
                setStatus('New');
            }
        }
    }, [isOpen, task]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave({
                ...(task ? { id: task.id } : {}),
                title,
                status,
                progress: task ? task.progress : 0
            });
            onClose();
        } catch (error) {
            console.error('Failed to save task', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'New Task'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                        { value: 'New', label: 'New' },
                        { value: 'Design', label: 'Design' },
                        { value: 'Implementation', label: 'Implementation' },
                        { value: 'Review', label: 'Review' },
                        { value: 'Done', label: 'Done' }
                    ]}
                    disabled={isLoading}
                />
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || !title.trim()}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
