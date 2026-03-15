# Overview

This document is the operation manual and screen specification for the "Local Project Management Tool".

## Table of Contents

- [Project Management Page](#project-management-page)
- [Basic Settings Page](#basic-settings-page)
- [Task List Page](#task-list-page)
- [Task Create/Edit Modal](#task-createedit-modal)
- [Gantt Chart Page](#gantt-chart-page)
- [Project Settings Page](#project-settings-page)

## Page Descriptions

### Project Management Page

- **Page Overview**
  The portal screen of this tool. Provides project creation and listing. URL is `/projects` or `/`.
  The menu bar displays "Project Management" (active) and "Basic Settings".

- **Page Content**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.en-proj-mgmt { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.en-proj-mgmt h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.en-proj-mgmt-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; }
.en-proj-mgmt-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.en-proj-mgmt-nav a.active { background: #007bff; color: white; }
.en-proj-mgmt .form-row { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
.en-proj-mgmt input[type="text"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex: 1; max-width: 400px; }
.en-proj-mgmt button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.en-proj-mgmt button.primary { background-color: #007bff; color: white; border: none; }
.en-proj-mgmt .project-list { list-style: none; padding: 0; }
.en-proj-mgmt .project-list li { padding: 12px 15px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 8px; cursor: pointer; }
.en-proj-mgmt .project-list li:hover { background-color: #f0f7ff; border-color: #007bff; }
</style>
<div class="en-proj-mgmt">
  <nav class="en-proj-mgmt-nav">
    <a href="#" class="active">Project Management</a>
    <a href="#">Basic Settings</a>
  </nav>
  <h1>Project Management</h1>
  <section>
    <h2 style="font-size: 1.1em; color: #666;">New Project</h2>
    <div class="form-row">
      <input type="text" placeholder="Enter project name" />
      <button class="primary">Create</button>
    </div>
  </section>
  <section>
    <h2 style="font-size: 1.1em; color: #666;">Project List</h2>
    <ul class="project-list">
      <li>▶ New Product Development</li>
      <li>▶ Website Redesign</li>
      <li>▶ Internal Tool Improvement</li>
    </ul>
  </section>
</div>
</div>

- **Operations**
  - **Create New Project**: Enter a project name and press "Create". Validation errors (empty, prohibited characters, duplicates) will display error messages.
  - **Select Project**: Click a project in the list to navigate to its task list page (`/projects/<encoded-name>`).

### Basic Settings Page

- **Page Overview**
  A screen for configuring system-wide defaults (task statuses, task types, assignees, daily work hours, holiday definitions). URL is `/settings`. These settings are not under Git management.
  The menu bar displays "Project Management" and "Basic Settings" (active).

- **Page Content**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.en-global-settings { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.en-global-settings h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.en-global-settings-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; }
.en-global-settings-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.en-global-settings-nav a.active { background: #007bff; color: white; }
.en-global-settings .form-group { margin-bottom: 20px; }
.en-global-settings label { display: block; margin-bottom: 5px; font-weight: bold; }
.en-global-settings input[type="text"], .en-global-settings input[type="number"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
.en-global-settings ul { list-style: none; padding: 0; }
.en-global-settings li { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.en-global-settings button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.en-global-settings button.primary { background-color: #007bff; color: white; border: none; }
</style>
<div class="en-global-settings">
  <nav class="en-global-settings-nav">
    <a href="#">Project Management</a>
    <a href="#" class="active">Basic Settings</a>
  </nav>
  <h1>Basic Settings</h1>
  <section>
    <div class="form-group">
      <label>Daily Work Hours</label>
      <input type="number" value="8.0" />
    </div>
    <div class="form-group">
      <label>Task Statuses</label>
      <ul>
        <li><input type="text" value="New" /> <button>Delete</button></li>
        <li><input type="text" value="Done" /> <label><input type="checkbox" checked /> Completed State</label></li>
        <li><button>Add Status</button></li>
      </ul>
    </div>
    <div class="form-group">
      <label>Assignees</label>
      <ul>
        <li>Name: <input value="Alice" /> Productivity: <input value="1.0" type="number" step="0.1" style="width: 60px" /></li>
        <li><button>Add Assignee</button></li>
      </ul>
    </div>
  </section>
  <button class="primary">Save</button>
</div>
</div>

- **Operations**
  - **Change Settings**: Modify input fields and press "Save" to update `data/setting.json`.

### Task List Page

- **Page Overview**
  A screen for displaying and managing tasks for the selected project. URL is `/projects/<encoded-name>`.
  The menu bar displays "Project Management", "Task List" (active), "Gantt Chart", "Project Settings", a project switch dropdown, and Undo/Redo buttons.

- **Page Content**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.en-task-list { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.en-task-list-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; align-items: center; }
.en-task-list-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.en-task-list-nav a.active { background: #007bff; color: white; }
.en-task-list-nav .spacer { flex: 1; }
.en-task-list-nav select { padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
.en-task-list header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.en-task-list h1 { margin: 0; color: #444; }
.en-task-list .actions { display: flex; gap: 10px; }
.en-task-list input[type="text"], .en-task-list select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.en-task-list button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.en-task-list button.primary { background-color: #28a745; color: white; border: none; }
.en-task-list table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.en-task-list th, .en-task-list td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
.en-task-list th { background-color: #f8f9fa; font-weight: 600; color: #555; }
</style>
<div class="en-task-list">
  <nav class="en-task-list-nav">
    <a href="#">Projects</a>
    <a href="#" class="active">Task List</a>
    <a href="#">Gantt Chart</a>
    <a href="#">Project Settings</a>
    <span class="spacer"></span>
    <select><option>New Product Development</option><option>Website Redesign</option></select>
    <span style="display:flex;gap:5px"><button style="padding:4px 8px;font-size:0.9em">↩ Undo</button><button style="padding:4px 8px;font-size:0.9em">↪ Redo</button></span>
  </nav>
  <header>
    <h1>Task List</h1>
    <div class="actions">
      <input type="text" placeholder="Search..." />
      <select><option>All Statuses</option></select>
      <button class="primary">Add Task</button>
    </div>
  </header>
  <table>
    <thead><tr><th>Title</th><th>Status</th><th>Assignee</th><th>Due Date</th><th>Actions</th></tr></thead>
    <tbody>
      <tr><td>▶ Task A</td><td><span style="background:#e2e3e5;padding:4px 8px;border-radius:12px;font-size:0.85em">Thinking</span></td><td>Alice</td><td>2024-01-01</td><td><button>Edit</button> <button>Delete</button></td></tr>
      <tr><td style="padding-left:20px">Subtask A-1</td><td><span style="background:#d4edda;padding:4px 8px;border-radius:12px;font-size:0.85em">Done</span></td><td>Bob</td><td>2024-01-02</td><td><button>Edit</button> <button>Delete</button></td></tr>
    </tbody>
  </table>
</div>
</div>

- **Operations**
  - **Reorder Tasks**: Drag and drop task rows to reorder them.
  - **Add Task**: Click "Add Task" to open the task creation modal.
  - **Search/Filter**: Search by title and filter by status.
  - **Hierarchy**: Toggle subtask visibility by clicking the ▶ icon.
  - **Edit/Delete**: Execute actions via buttons on each row.
  - **Switch Project**: Use the dropdown in the menu bar to switch between projects.
  - **Undo/Redo**: Use the Undo/Redo buttons to cancel or redo the last operation.

### Task Create/Edit Modal

- **Page Overview**
  A modal dialog for entering and editing detailed task information.

- **Page Content**
<div style="background-color: #f4f4f9; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.en-task-modal { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); width: 100%; max-width: 500px; margin: 0 auto; }
.en-task-modal h2 { margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; }
.en-task-modal .field { margin-bottom: 15px; }
.en-task-modal label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
.en-task-modal input[type="text"], .en-task-modal input[type="date"], .en-task-modal input[type="number"], .en-task-modal select, .en-task-modal textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.en-task-modal textarea { height: 100px; resize: vertical; }
.en-task-modal .row { display: flex; gap: 15px; }
.en-task-modal .row .field { flex: 1; }
.en-task-modal .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
.en-task-modal button { cursor: pointer; padding: 10px 20px; border: 1px solid #ddd; border-radius: 4px; background: white; font-weight: 500; }
.en-task-modal button.primary { background-color: #007bff; color: white; border: none; }
</style>
<div class="en-task-modal">
  <h2>Create/Edit Task</h2>
  <form onsubmit="event.preventDefault()">
    <div class="field"><label>Title</label><input type="text" required placeholder="Enter task title" /></div>
    <div class="field"><label>Type</label><select><option>Task</option><option>Bug</option></select></div>
    <div class="field"><label>Parent Task</label><select><option>(None)</option><option>Task A</option></select></div>
    <div class="row">
      <div class="field"><label>Planned Hours</label><input type="number" placeholder="0.0" /></div>
      <div class="field"><label>Assignee</label><select><option>Alice</option><option>Bob</option></select></div>
    </div>
    <div class="row">
      <div class="field"><label>Start Date</label><input type="date" /></div>
      <div class="field"><label>Due Date</label><input type="date" /></div>
    </div>
    <div class="field"><label>Description</label><textarea placeholder="Enter task details..."></textarea></div>
    <div class="actions">
      <button type="button">Cancel</button>
      <button class="primary" type="submit">Save</button>
    </div>
  </form>
</div>
</div>

- **Operations**
  - **Save**: Enter required fields and click "Save" to save the task and create a Git commit.
  - **Cancel**: Discard changes and close the modal.

### Gantt Chart Page

- **Page Overview**
  Visualizes the selected project's schedule in Gantt chart format. URL is `/projects/<encoded-name>/gantts`.
  The menu bar displays "Project Management", "Task List", "Gantt Chart" (active), "Project Settings", a project switch dropdown, and Undo/Redo buttons.

- **Page Content**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.en-gantt { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.en-gantt-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; align-items: center; }
.en-gantt-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.en-gantt-nav a.active { background: #007bff; color: white; }
.en-gantt-nav .spacer { flex: 1; }
.en-gantt header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.en-gantt h1 { margin: 0; color: #444; }
.en-gantt button { cursor: pointer; padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; background: white; }
</style>
<div class="en-gantt">
  <nav class="en-gantt-nav">
    <a href="#">Projects</a>
    <a href="#">Task List</a>
    <a href="#" class="active">Gantt Chart</a>
    <a href="#">Project Settings</a>
    <span class="spacer"></span>
    <select style="padding:5px;border:1px solid #ddd;border-radius:4px"><option>New Product Development</option></select>
    <span style="display:flex;gap:5px"><button style="padding:4px 8px;font-size:0.9em">↩ Undo</button><button style="padding:4px 8px;font-size:0.9em">↪ Redo</button></span>
  </nav>
  <header>
    <h1>Gantt Chart</h1>
    <div style="display:flex;gap:10px;align-items:center">
      <button>Zoom In</button>
      <button>Zoom Out</button>
      <label><input type="checkbox" /> Show Progress Line</label>
    </div>
  </header>
  <div style="border:1px solid #eee;border-radius:4px;min-height:150px;padding:10px;color:#888;text-align:center">
    [Gantt chart bars rendered here based on task schedule data]
  </div>
</div>
</div>

- **Operations**
  - **Reorder Tasks**: Drag and drop task rows on the left side to reorder them.
  - **Toggle View**: Zoom in/out and toggle the Inazuma line visibility.

### Project Settings Page

- **Page Overview**
  A screen for modifying project-specific settings (override values for basic settings, metadata). URL is `/projects/<encoded-name>/settings`. Changes are committed to Git.
  The menu bar displays "Project Management", "Task List", "Gantt Chart", "Project Settings" (active), a project switch dropdown, and Undo/Redo buttons.

- **Page Content**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.en-proj-settings { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.en-proj-settings h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.en-proj-settings-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; align-items: center; }
.en-proj-settings-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.en-proj-settings-nav a.active { background: #007bff; color: white; }
.en-proj-settings-nav .spacer { flex: 1; }
.en-proj-settings .form-group { margin-bottom: 20px; }
.en-proj-settings label { display: block; margin-bottom: 5px; font-weight: bold; }
.en-proj-settings input[type="number"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
.en-proj-settings button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.en-proj-settings button.primary { background-color: #007bff; color: white; border: none; }
</style>
<div class="en-proj-settings">
  <nav class="en-proj-settings-nav">
    <a href="#">Projects</a>
    <a href="#">Task List</a>
    <a href="#">Gantt Chart</a>
    <a href="#" class="active">Project Settings</a>
    <span class="spacer"></span>
    <select style="padding:5px;border:1px solid #ddd;border-radius:4px"><option>New Product Development</option></select>
  </nav>
  <h1>Project Settings: New Product Development</h1>
  <section>
    <h2 style="font-size: 1.1em; color: #666;">Basic Settings Override</h2>
    <p style="color: #888; font-size: 0.9em;">* Empty fields will use global basic settings values.</p>
    <div class="form-group">
      <label>Daily Work Hours (Override)</label>
      <input type="number" placeholder="Global setting: 8.0" />
    </div>
  </section>
  <button class="primary">Save</button>
</div>
</div>

- **Operations**
  - **Change Settings**: Enter override values and press "Save" to update `data/<project-name>/setting.json` and create a Git commit.
