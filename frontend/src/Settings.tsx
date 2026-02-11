import React, { useEffect, useState } from 'react';
import { Tabs, TextInput, NumberInput, Button, Group, Box, LoadingOverlay, Notification, MultiSelect, TagsInput, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Settings, BasicSettings, ProjectSettings, TaskStatus, TaskType, Assignee, HolidayDefinition } from './types';
import { fetchSettings, saveSettings } from './api';
import { IconCheck, IconX } from '@tabler/icons-react';

export function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<Settings>({
    initialValues: {
      basic: {
        task_statuses: [],
        task_types: [],
        assignees: [],
        daily_work_hours: 8,
        holiday_definition: {
          holiday_csv_url: '',
          weekend_days: [],
          extra_holidays: [],
          extra_workdays: [],
        },
      },
      project: {
        project_name: '',
        basic_settings_override: null,
      },
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchSettings();
        // Ensure we populate the form with fetched data
        // If data is partial, we might need to merge with defaults, but assuming API returns full struct
        form.setValues(data);
      } catch (err) {
        setError('Failed to load settings. Please check if the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (values: Settings) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveSettings(values);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maw={800} mx="auto" mt="xl" pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
      
      {error && (
        <Notification icon={<IconX size={18} />} color="red" title="Error" onClose={() => setError(null)} mb="md">
          {error}
        </Notification>
      )}

      {success && (
        <Notification icon={<IconCheck size={18} />} color="teal" title="Success" onClose={() => setSuccess(null)} mb="md">
          {success}
        </Notification>
      )}

      <h1>Settings</h1>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">Basic Settings</Tabs.Tab>
            <Tabs.Tab value="project">Project Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="xs">
            {/* Basic Settings Form Fields */}
            <BasicSettingsForm form={form} path="basic" />
          </Tabs.Panel>

          <Tabs.Panel value="project" pt="xs">
            {/* Project Settings Form Fields */}
            <ProjectSettingsForm form={form} path="project" />
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={saving}>Save Settings</Button>
        </Group>
      </form>
    </Box>
  );
}

function getValueAtPath(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function BasicSettingsForm({ form, path }: { form: any, path: string }) {
  const values = getValueAtPath(form.values, path) || {};
  const tasksStatuses = values.task_statuses || [];
  const taskTypes = values.task_types || [];
  const assignees = values.assignees || [];
  const weekendDays = values.holiday_definition?.weekend_days || [];

  return (
    <Box>
      <h3>General</h3>
      <NumberInput
        label="Daily Work Hours"
        {...form.getInputProps(`${path}.daily_work_hours`)}
        min={0}
        max={24}
      />

      <h3>Task Statuses</h3>
      <Box mb="md">
        {tasksStatuses.map((status: TaskStatus, index: number) => (
           <Group key={index} mt="xs">
             <TextInput placeholder="ID" {...form.getInputProps(`${path}.task_statuses.${index}.id`)} />
             <TextInput placeholder="Name" {...form.getInputProps(`${path}.task_statuses.${index}.name`)} />
             <Checkbox label="Completed State" {...form.getInputProps(`${path}.task_statuses.${index}.is_completed_state`, { type: 'checkbox' })} />
             <Button color="red" onClick={() => form.removeListItem(`${path}.task_statuses`, index)}>Remove</Button>
           </Group>
        ))}
        <Button mt="xs" onClick={() => form.insertListItem(`${path}.task_statuses`, { id: '', name: '', is_completed_state: false })}>
          Add Task Status
        </Button>
      </Box>


      <h3>Task Types</h3>
        <Box mb="md">
        {taskTypes.map((type: TaskType, index: number) => (
           <Group key={index} mt="xs">
             <TextInput placeholder="ID" {...form.getInputProps(`${path}.task_types.${index}.id`)} />
             <TextInput placeholder="Name" {...form.getInputProps(`${path}.task_types.${index}.name`)} />
             <Button color="red" onClick={() => form.removeListItem(`${path}.task_types`, index)}>Remove</Button>
           </Group>
        ))}
        <Button mt="xs" onClick={() => form.insertListItem(`${path}.task_types`, { id: '', name: '' })}>
          Add Task Type
        </Button>
      </Box>

      <h3>Assignees</h3>
       <Box mb="md">
        {assignees.map((assignee: Assignee, index: number) => (
           <Group key={index} mt="xs">
             <TextInput placeholder="ID" {...form.getInputProps(`${path}.assignees.${index}.id`)} />
             <TextInput placeholder="Name" {...form.getInputProps(`${path}.assignees.${index}.name`)} />
             <NumberInput placeholder="Productivity" {...form.getInputProps(`${path}.assignees.${index}.productivity_ratio`)} step={0.1} min={0} />
             <NumberInput placeholder="Commitment" {...form.getInputProps(`${path}.assignees.${index}.commitment_ratio`)} step={0.1} min={0} max={1} />
             <Button color="red" onClick={() => form.removeListItem(`${path}.assignees`, index)}>Remove</Button>
           </Group>
        ))}
        <Button mt="xs" onClick={() => form.insertListItem(`${path}.assignees`, { id: '', name: '', productivity_ratio: 1.0, commitment_ratio: 1.0 })}>
          Add Assignee
        </Button>
      </Box>

      <h3>Holiday Definition</h3>
      <TextInput
        label="Holiday CSV URL"
        {...form.getInputProps(`${path}.holiday_definition.holiday_csv_url`)}
      />
      
      {/* Weekend Days - simplified as multi select for 0-6 */}
      <MultiSelect
        label="Weekend Days"
        data={[
          { value: '0', label: 'Sunday' },
          { value: '1', label: 'Monday' },
          { value: '2', label: 'Tuesday' },
          { value: '3', label: 'Wednesday' },
          { value: '4', label: 'Thursday' },
          { value: '5', label: 'Friday' },
          { value: '6', label: 'Saturday' },
        ]}
        {...form.getInputProps(`${path}.holiday_definition.weekend_days`)}
        value={weekendDays.map(String)}
        onChange={(val: string[]) => form.setFieldValue(`${path}.holiday_definition.weekend_days`, val.map(Number))}
      />

      <TagsInput
        label="Extra Holidays (YYYY-MM-DD)"
        {...form.getInputProps(`${path}.holiday_definition.extra_holidays`)}
      />

       <TagsInput
        label="Extra Workdays (YYYY-MM-DD)"
        {...form.getInputProps(`${path}.holiday_definition.extra_workdays`)}
      />

    </Box>
  );
}

function ProjectSettingsForm({ form, path }: { form: any, path: string }) {
  // Use a different path if we are editing the override settings
  const overridePath = `${path}.basic_settings_override`;
  const hasOverride = !!form.values.project.basic_settings_override;

  return (
    <Box>
      <TextInput
        label="Project Name"
        {...form.getInputProps(`${path}.project_name`)}
      />

      <Checkbox
        mt="md"
        label="Override Basic Settings"
        checked={hasOverride}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
             if (event.currentTarget.checked) {
                 // Copy basic settings to override
                 form.setFieldValue(overridePath, JSON.parse(JSON.stringify(form.values.basic)));
             } else {
                 form.setFieldValue(overridePath, null);
             }
        }}
      />

      {hasOverride && (
        <Box mt="md" p="md" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
            <BasicSettingsForm form={form} path={overridePath} />
        </Box>
      )}
    </Box>
  );
}
