# 概要

本書は「Local Project Management Tool」の操作マニュアル兼画面仕様書です。

## 目次

* [設定画面](#設定画面)
* [タスク一覧画面](#タスク一覧画面)
* [タスク作成/編集モーダル](#タスク作成編集モーダル)
* [ガントチャート画面](#ガントチャート画面)

## 各ページ説明

### 設定画面

* **ページ概要**
  プロジェクトの基本設定およびプロジェクト固有の設定を行う画面です。

* **ページ内容**
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

* **操作方法**
  * **設定変更**: 各入力フィールドを変更し、「Save Settings」ボタンを押下することで設定を保存します。保存時、設定ファイル(JSON)が更新されます。
  * **ステータス追加/削除**: タスクの状態定義を追加削除できます。
  * **担当者管理**: 担当者の名前や生産性比率を設定できます。

### タスク一覧画面

* **ページ概要**
  登録されているタスクを一覧表示し、管理するメイン画面です。

* **ページ内容**
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

* **操作方法**
  * **タスク追加**: 「Add Task」ボタンを押下すると、タスク作成モーダルが開きます。
  * **検索・フィルタ**: テキストボックスでタイトル検索、ドロップダウンでステータスフィルタが可能です。
  * **階層表示**: タイトル左の▶をクリックすることで子タスクの表示/非表示を切り替えられます。
  * **編集・削除**: 各行のボタンから操作を実行します。

### タスク作成/編集モーダル

* **ページ概要**
  タスクの詳細情報を入力・編集するモーダルダイアログです。

* **ページ内容**
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

* **操作方法**
  * **保存**: 必須項目を入力し「Save」を押下するとタスクが保存され、Gitコミットが作成されます。
  * **キャンセル**: 変更を破棄してモーダルを閉じます。

### ガントチャート画面

* **ページ概要**
  タスクのスケジュールをガントチャート形式で可視化します。

* **ページ内容**
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

* **操作方法**
  * **表示切替**: ズーム操作やイナズマ線の表示/非表示を切り替えられます。
  * **バー操作**: （将来拡張）バーをドラッグして期間を変更できる可能性があります。現在は表示のみ。
