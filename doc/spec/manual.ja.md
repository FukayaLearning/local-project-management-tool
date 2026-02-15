# 概要

本書は「Local Project Management Tool」の操作マニュアル兼画面仕様書です。

## 目次

- [設定画面](#設定画面)
- [タスク一覧画面](#タスク一覧画面)
- [タスク作成/編集モーダル](#タスク作成編集モーダル)
- [ガントチャート画面](#ガントチャート画面)

## 各ページ説明

### 設定画面

- **ページ概要**
  プロジェクトの基本設定およびプロジェクト固有の設定を行う画面です。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.settings-page { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.settings-page h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.settings-page section { margin-bottom: 30px; }
.settings-page h2 { font-size: 1.2em; color: #666; margin-bottom: 15px; margin-top: 0; }
.settings-page .form-group { margin-bottom: 20px; }
.settings-page label { display: block; margin-bottom: 5px; font-weight: bold; }
.settings-page input[type="text"], .settings-page input[type="number"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
.settings-page ul { list-style: none; padding: 0; }
.settings-page li { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.settings-page button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.settings-page button:hover { background: #f0f0f0; }
.settings-page button.primary { background-color: #007bff; color: white; border: none; }
.settings-page button.primary:hover { background-color: #0056b3; }
</style>
<div class="settings-page">
  <h1>Settings</h1>
  <section>
    <h2>Basic Settings</h2>
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
  <section>
    <h2>Project Settings</h2>
    <div class="form-group">
      <label>Project Name</label>
      <input type="text" value="My Project" />
    </div>
  </section>
  <button class="primary">Save Settings</button>
</div>
</div>

- **操作方法**
  - **設定変更**: 各入力フィールドを変更し、「Save Settings」ボタンを押下することで設定を保存します。保存時、設定ファイル(JSON)が更新されます。
  - **ステータス追加/削除**: タスクの状態定義を追加削除できます。
  - **担当者管理**: 担当者の名前や生産性比率を設定できます。

### タスク一覧画面

- **ページ概要**
  登録されているタスクを一覧表示し、管理するメイン画面です。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.task-list-page { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.task-list-page header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.task-list-page h1 { margin: 0; color: #444; }
.task-list-page .actions { display: flex; gap: 10px; }
.task-list-page input[type="text"], .task-list-page select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.task-list-page button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.task-list-page button:hover { background: #f0f0f0; }
.task-list-page button.primary { background-color: #28a745; color: white; border: none; }
.task-list-page button.primary:hover { background-color: #218838; }
.task-list-page table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.task-list-page th, .task-list-page td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
.task-list-page th { background-color: #f8f9fa; font-weight: 600; color: #555; }
.task-list-page tr:hover { background-color: #f9f9f9; }
.status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 0.85em; font-weight: 500; }
.status-thinking { background-color: #e2e3e5; color: #383d41; }
.status-done { background-color: #d4edda; color: #155724; }
</style>
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
      <tr><th>Title</th><th>Status</th><th>Assignee</th><th>Due Date</th><th>Actions</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>▶ Task A</td>
        <td><span class="status-badge status-thinking">Thinking</span></td>
        <td>Alice</td>
        <td>2024-01-01</td>
        <td><button>Edit</button> <button>Delete</button></td>
      </tr>
      <tr>
        <td style="padding-left: 20px">Subtask A-1</td>
        <td><span class="status-badge status-done">Done</span></td>
        <td>Bob</td>
        <td>2024-01-02</td>
        <td><button>Edit</button> <button>Delete</button></td>
      </tr>
    </tbody>
  </table>
</div>
</div>

- **操作方法**
  - **タスク追加**: 「Add Task」ボタンを押下すると、タスク作成モーダルが開きます。
  - **検索・フィルタ**: テキストボックスでタイトル検索、ドロップダウンでステータスフィルタが可能です。
  - **階層表示**: タイトル左の▶をクリックすることで子タスクの表示/非表示を切り替えられます。
  - **編集・削除**: 各行のボタンから操作を実行します。

### タスク作成/編集モーダル

- **ページ概要**
  タスクの詳細情報を入力・編集するモーダルダイアログです。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.task-modal { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); width: 100%; max-width: 500px; margin: 0 auto; }
.task-modal h2 { margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; }
.task-modal .field { margin-bottom: 15px; }
.task-modal label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
.task-modal input[type="text"], .task-modal input[type="date"], .task-modal input[type="number"], .task-modal select, .task-modal textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.task-modal textarea { height: 100px; resize: vertical; }
.task-modal .row { display: flex; gap: 15px; }
.task-modal .row .field { flex: 1; }
.task-modal .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
.task-modal button { cursor: pointer; padding: 10px 20px; border: 1px solid #ddd; border-radius: 4px; background: white; font-weight: 500; }
.task-modal button:hover { background: #f0f0f0; }
.task-modal button.primary { background-color: #007bff; color: white; border: none; }
.task-modal button.primary:hover { background-color: #0056b3; }
</style>
<div class="task-modal">
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

- **操作方法**
  - **保存**: 必須項目を入力し「Save」を押下するとタスクが保存され、Gitコミットが作成されます。
  - **キャンセル**: 変更を破棄してモーダルを閉じます。

### ガントチャート画面

- **ページ概要**
  タスクのスケジュールをガントチャート形式で可視化します。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.gantt-page { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.gantt-page header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.gantt-page h1 { margin: 0; color: #444; }
.gantt-page .controls { display: flex; gap: 10px; align-items: center; }
.gantt-page button { cursor: pointer; padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.gantt-page button:hover { background: #f0f0f0; }
.gantt-container { border: 1px solid #eee; border-radius: 4px; overflow: hidden; position: relative; }
.timeline-header { display: flex; background: #f8f9fa; border-bottom: 1px solid #eee; }
.timeline-header span { flex: 0 0 50px; text-align: center; padding: 5px 0; font-size: 0.8em; color: #666; border-right: 1px solid #eee; }
.gantt-bars { padding: 10px 0; background: repeating-linear-gradient(90deg, transparent, transparent 49px, #eee 50px); background-size: 50px 100%; }
.bar-row { display: flex; align-items: center; margin-bottom: 10px; position: relative; height: 30px; }
.label { width: 100px; padding-left: 10px; font-weight: 500; font-size: 0.9em; flex-shrink: 0; background: rgba(255, 255, 255, 0.8); z-index: 1; }
.bar-group { position: relative; flex-grow: 1; height: 100%; }
.bar { position: absolute; height: 12px; border-radius: 6px; top: 9px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }
.bar.planned { background-color: #a0c4ff; opacity: 0.7; z-index: 1; top: 4px; height: 10px; }
.bar.actual { background-color: #ffadad; z-index: 2; top: 16px; height: 10px; }
.inazuma-line { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; }
.inazuma-path { stroke: red; stroke-width: 2; fill: none; stroke-dasharray: 4; }
</style>
<div class="gantt-page">
  <header>
    <h1>Gantt Chart</h1>
    <div class="controls">
      <button>Zoom In</button>
      <button>Zoom Out</button>
      <label><input type="checkbox" /> Show Progress Line</label>
    </div>
  </header>
  <div class="gantt-container" style="min-height: 200px">
    <div class="timeline-header">
      <span>Jan 1</span><span>Jan 2</span><span>Jan 3</span><span>Jan 4</span><span>Jan 5</span><span>Jan 6</span><span>Jan 7</span>
    </div>
    <div class="gantt-bars">
      <div class="bar-row">
        <div class="label">Task A</div>
        <div class="bar-group">
          <div class="bar planned" style="left: 0; width: 150px;" title="Planned: Jan 1 - Jan 3"></div>
          <div class="bar actual" style="left: 0; width: 50px;" title="Actual: Jan 1"></div>
        </div>
      </div>
      <div class="bar-row">
        <div class="label">Task B</div>
        <div class="bar-group">
          <div class="bar planned" style="left: 150px; width: 100px"></div>
        </div>
      </div>
    </div>
    <svg class="inazuma-line">
      <path class="inazuma-path" d="M 50,0 L 50,30 L 150,60" />
    </svg>
  </div>
</div>
</div>

- **操作方法**
  - **表示切替**: ズーム操作やイナズマ線の表示/非表示を切り替えられます。
  - **バー操作**: （将来拡張）バーをドラッグして期間を変更できる可能性があります。現在は表示のみ。
