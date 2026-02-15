# Overview

This document is the operation manual and screen specification for the "Local Project Management Tool".

## Table of Contents

* [Settings Screen](#settings-screen)
* [Task List Screen](#task-list-screen)
* [Task Create/Edit Modal](#task-createedit-modal)
* [Gantt Chart Screen](#gantt-chart-screen)

## Page Descriptions

### Settings Screen

* **Page Overview**
  A screen for performing basic project settings and project-specific configuration.

* **Page Content**
  ```html
  <div class="settings-page">
    <h1>Settings</h1>
    <section>
      <h2>Basic Settings</h2>
      <div class="form-group">
        <label>Daily Work Hours</label>
        <input type="number" value="8.0" />
      </div>
      <!-- Task Status Definitions -->
      <div class="form-group">
        <label>Task Statuses</label>
        <ul>
          <li><input type="text" value="New" /> <button>Delete</button></li>
          <li><input type="text" value="Done" /> <input type="checkbox" checked /> Completed State</li>
          <button>Add Status</button>
        </ul>
      </div>
      <!-- Assignees -->
      <div class="form-group">
        <label>Assignees</label>
        <ul>
          <li>Name: <input value="Alice" /> Productivity: <input value="1.0" /></li>
          <button>Add Assignee</button>
        </ul>
      </div>
    </section>
    <section>
      <h2>Project Settings</h2>
      <div class="form-group">
        <label>Project Name</label>
        <input type="text" value="My Project" />
      </div>
    </section>
    <button class="primary">Save Settings</button>
  </div>
  ```

* **Operations**
  * **Change Settings**: Modify input fields and press "Save Settings" to save configurations to the JSON file.
  * **Add/Remove Status**: Add or remove task status definitions.
  * **Manage Assignees**: Configure assignee names and productivity ratios.

### Task List Screen

* **Page Overview**
  The main screen for listing and managing registered tasks.

* **Page Content**
  ```html
  <div class="task-list-page">
    <header>
      <h1>Tasks</h1>
      <div class="actions">
        <input type="text" placeholder="Search..." />
        <select><option>All Statuses</option></select>
        <button class="primary">Add Task</button>
        <button>Export CSV</button>
        <button>Import CSV</button>
      </div>
    </header>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Assignee</th>
          <th>Due Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>▶ Task A</td>
          <td>Thinking</td>
          <td>Alice</td>
          <td>2024-01-01</td>
          <td><button>Edit</button> <button>Delete</button></td>
        </tr>
        <tr>
          <td style="padding-left: 20px;">Subtask A-1</td>
          <td>Done</td>
          <td>Bob</td>
          <td>2024-01-02</td>
          <td><button>Edit</button> <button>Delete</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  ```

* **Operations**
  * **Add Task**: Clicking "Add Task" opens the Task Creation Modal.
  * **Search/Filter**: Search by title text and filter by status using the dropdown.
  * **Hierarchy**: Toggle subtask visibility by clicking the ▶ icon left of the title.
  * **Edit/Delete**: Execute actions via buttons on each row.

### Task Create/Edit Modal

* **Page Overview**
  A modal dialog for entering and editing detailed task information.

* **Page Content**
  ```html
  <div class="modal">
    <h2>Create/Edit Task</h2>
    <form>
      <div class="field">
        <label>Title</label>
        <input type="text" required />
      </div>
      <div class="field">
        <label>Type</label>
        <select><option>Task</option><option>Bug</option></select>
      </div>
      <div class="field">
        <label>Parent Task</label>
        <select><option>(None)</option><option>Task A</option></select>
      </div>
      <div class="row">
        <div class="field"><label>Planned Hours</label><input type="number" /></div>
        <div class="field"><label>Assignee</label><select>...</select></div>
      </div>
      <div class="row">
        <div class="field"><label>Start Date</label><input type="date" /></div>
        <div class="field"><label>Due Date</label><input type="date" /></div>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea></textarea>
      </div>
      <div class="actions">
        <button>Cancel</button>
        <button class="primary">Save</button>
      </div>
    </form>
  </div>
  ```

* **Operations**
  * **Save**: Entering required fields and clicking "Save" saves the task and creates a Git commit.
  * **Cancel**: Discards changes and closes the modal.

### Gantt Chart Screen

* **Page Overview**
  Visualizes task schedules in a Gantt chart format.

* **Page Content**
  ```html
  <div class="gantt-page">
    <header>
      <h1>Gantt Chart</h1>
      <div class="controls">
        <button>Zoom In</button>
        <button>Zoom Out</button>
        <label><input type="checkbox" /> Show Progress Line</label>
      </div>
    </header>
    <div class="gantt-container">
      <!-- SVG or Canvas rendering area -->
      <div class="timeline-header">
        <span>Jan 1</span><span>Jan 2</span><span>Jan 3</span>...
      </div>
      <div class="gantt-bars">
        <div class="bar-row">
          <div class="label">Task A</div>
          <div class="bar-group">
            <div class="bar planned" style="left: 0; width: 100px;"></div>
            <div class="bar actual" style="left: 0; width: 50px;"></div>
          </div>
        </div>
      </div>
      <!-- Inazuma Line Overlay -->
      <svg class="inazuma-line">...</svg>
    </div>
  </div>
  ```

* **Operations**
  * **Toggle View**: Zoom in/out and toggle the Inazuma line visibility.
  * **Bar Operations**: (Future extension) Potential to change duration by dragging bars. Currently display only.
