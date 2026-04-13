# 概要

本書は「Local Project Management Tool」の操作マニュアル兼画面仕様書です。

## 目次

- [プロジェクト管理ページ](#プロジェクト管理ページ)
- [基本設定ページ](#基本設定ページ)
- [タスク一覧ページ](#タスク一覧ページ)
- [タスク作成/編集モーダル](#タスク作成編集モーダル)
- [ガントチャートページ](#ガントチャートページ)
- [プロジェクト設定ページ](#プロジェクト設定ページ)

## 各ページ説明

### プロジェクト管理ページ

- **ページ概要**
  本ツールのポータル画面です。プロジェクトの新規作成と一覧表示を行います。URLは `/projects` または `/` です。
  メニューバーには「プロジェクト管理」（アクティブ）と「基本設定」が表示されます。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.proj-mgmt-page { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.proj-mgmt-page h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.proj-mgmt-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; }
.proj-mgmt-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.proj-mgmt-nav a.active { background: #007bff; color: white; }
.proj-mgmt-page .form-row { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
.proj-mgmt-page input[type="text"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; flex: 1; max-width: 400px; }
.proj-mgmt-page button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.proj-mgmt-page button.primary { background-color: #007bff; color: white; border: none; }
.proj-mgmt-page .project-list { list-style: none; padding: 0; }
.proj-mgmt-page .project-list li { padding: 12px 15px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 8px; cursor: pointer; }
.proj-mgmt-page .project-list li:hover { background-color: #f0f7ff; border-color: #007bff; }
</style>
<div class="proj-mgmt-page">
  <nav class="proj-mgmt-nav">
    <a href="#" class="active">プロジェクト管理</a>
    <a href="#">基本設定</a>
  </nav>
  <h1>プロジェクト管理</h1>
  <section>
    <h2 style="font-size: 1.1em; color: #666;">新規プロジェクト作成</h2>
    <div class="form-row">
      <input type="text" placeholder="プロジェクト名を入力" />
      <button class="primary">新規登録</button>
    </div>
  </section>
  <section>
    <h2 style="font-size: 1.1em; color: #666;">プロジェクト一覧</h2>
    <ul class="project-list">
      <li>▶ 新製品開発プロジェクト</li>
      <li>▶ Webサイトリニューアル</li>
      <li>▶ 社内ツール改善</li>
    </ul>
  </section>
</div>
</div>

- **操作方法**
  - **プロジェクト新規作成**: プロジェクト名を入力し「新規登録」ボタンを押下します。バリデーションエラー（空文字、禁止文字、重複）時はエラーメッセージが表示されます。
  - **プロジェクト選択**: 一覧からプロジェクトをクリックすると、そのプロジェクトのタスク一覧ページ（`/projects/<encoded-name>`）へ遷移します。

### 基本設定ページ

- **ページ概要**
  システム全体の既定値（タスク状態、タスク種類、担当者、1日投入時間、休日定義）を設定する画面です。URLは `/settings` です。この設定はGit管理されません。
  メニューバーには「プロジェクト管理」と「基本設定」（アクティブ）が表示されます。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.global-settings-page { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.global-settings-page h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.global-settings-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; }
.global-settings-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.global-settings-nav a.active { background: #007bff; color: white; }
.global-settings-page .form-group { margin-bottom: 20px; }
.global-settings-page label { display: block; margin-bottom: 5px; font-weight: bold; }
.global-settings-page input[type="text"], .global-settings-page input[type="number"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
.global-settings-page ul { list-style: none; padding: 0; }
.global-settings-page li { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
.global-settings-page button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.global-settings-page button.primary { background-color: #007bff; color: white; border: none; }
</style>
<div class="global-settings-page">
  <nav class="global-settings-nav">
    <a href="#">プロジェクト管理</a>
    <a href="#" class="active">基本設定</a>
  </nav>
  <h1>基本設定</h1>
  <section>
    <div class="form-group">
      <label>1日あたりの投入時間</label>
      <input type="number" value="8.0" />
    </div>
    <div class="form-group">
      <label>タスク状態</label>
      <ul>
        <li><input type="text" value="New" /> <button>削除</button></li>
        <li><input type="text" value="Done" /> <label><input type="checkbox" checked /> 完了状態</label></li>
        <li><button>状態を追加</button></li>
      </ul>
    </div>
    <div class="form-group">
      <label>担当者</label>
      <ul>
        <li>名前: <input value="Alice" /> 生産性比率: <input value="1.0" type="number" step="0.1" style="width: 60px" /></li>
        <li><button>担当者を追加</button></li>
      </ul>
    </div>
  </section>
  <button class="primary">保存</button>
</div>
</div>

- **操作方法**
  - **設定変更**: 各入力フィールドを変更し、「保存」ボタンを押下することで`data/setting.json`が更新されます。

### タスク一覧ページ

- **ページ概要**
  選択中のプロジェクトのタスク一覧を表示・管理する画面です。URLは `/projects/<encoded-name>` です。
  メニューバーには「プロジェクト管理」「タスク一覧」（アクティブ）「ガントチャート」「プロジェクト設定」とプロジェクト選択ドロップダウン、Undo/Redoボタンが表示されます。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.task-list-page { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.task-list-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; align-items: center; }
.task-list-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.task-list-nav a.active { background: #007bff; color: white; }
.task-list-nav .spacer { flex: 1; }
.task-list-nav select { padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
.task-list-nav .undo-redo { display: flex; gap: 5px; }
.task-list-nav .undo-redo button { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 0.9em; }
.task-list-page header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.task-list-page h1 { margin: 0; color: #444; }
.task-list-page .actions { display: flex; gap: 10px; }
.task-list-page input[type="text"], .task-list-page select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.task-list-page button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.task-list-page button.primary { background-color: #28a745; color: white; border: none; }
.task-list-page table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.task-list-page th, .task-list-page td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
.task-list-page th { background-color: #f8f9fa; font-weight: 600; color: #555; }
.task-list-page tr:hover { background-color: #f9f9f9; }
.status-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 0.85em; font-weight: 500; }
.status-thinking { background-color: #e2e3e5; color: #383d41; }
.status-done { background-color: #d4edda; color: #155724; }
</style>
<div class="task-list-page">
  <nav class="task-list-nav">
    <a href="#">プロジェクト管理</a>
    <a href="#" class="active">タスク一覧</a>
    <a href="#">ガントチャート</a>
    <a href="#">プロジェクト設定</a>
    <span class="spacer"></span>
    <select><option>新製品開発プロジェクト</option><option>Webサイトリニューアル</option></select>
    <span class="undo-redo"><button>↩ Undo</button><button>↪ Redo</button></span>
  </nav>
  <header>
    <h1>タスク一覧</h1>
    <div class="actions">
      <input type="text" placeholder="検索..." />
      <select><option>全ステータス</option></select>
      <button class="primary">タスク追加</button>
    </div>
  </header>
  <table>
    <thead>
      <tr><th>タイトル</th><th>状態</th><th>担当者</th><th>期限</th><th>操作</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>▶ タスク A</td>
        <td><span class="status-badge status-thinking">検討中</span></td>
        <td>Alice</td>
        <td>2024-01-01</td>
        <td><button>編集</button> <button>削除</button></td>
      </tr>
      <tr>
        <td style="padding-left: 20px">サブタスク A-1</td>
        <td><span class="status-badge status-done">完了</span></td>
        <td>Bob</td>
        <td>2024-01-02</td>
        <td><button>編集</button> <button>削除</button></td>
      </tr>
    </tbody>
  </table>
</div>
</div>

- **操作方法**
  - **順序変更**: タスク行をドラッグ＆ドロップすることで任意の順序に並べ替えられます（検索・フィルタが適用されていない場合のみ）。
  - **タスク追加**: 「タスク追加」ボタンを押下すると、タスク作成モーダルが開きます。
  - **検索・フィルタ**:
    - テキストボックスでタイトルによる部分一致検索が可能です。
    - ステータスドロップダウンおよび担当者ドロップダウンで表示タスクを絞り込めます。
  - **CSVダウンロード**: 画面上の「CSVダウンロード」ボタンから、現在開いているプロジェクトの全タスクデータをCSV形式でエクスポートできます。
  - **階層表示**: タイトル左の▶をクリックすることで子タスクの表示/非表示を切り替えられます。検索・フィルタ適用時はフラットなリストとして表示されます。
  - **編集・削除**: 各行のボタンから操作を実行します。
  - **プロジェクト切替**: メニューバーのドロップダウンリストで別プロジェクトに切り替えられます。
  - **Undo/Redo**: メニューバーのUndo/Redoボタンで直前の操作を取り消し/やり直しできます。

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
.task-modal button.primary { background-color: #007bff; color: white; border: none; }
</style>
<div class="task-modal">
  <h2>タスク作成/編集</h2>
  <form onsubmit="event.preventDefault()">
    <div class="field"><label>タイトル</label><input type="text" required placeholder="タスク名を入力" /></div>
    <div class="field"><label>種類</label><select><option>タスク</option><option>バグ</option></select></div>
    <div class="field"><label>親タスク</label><select><option>(なし)</option><option>タスク A</option></select></div>
    <div class="row">
      <div class="field"><label>予定工数</label><input type="number" placeholder="0.0" /></div>
      <div class="field"><label>担当者</label><select><option>Alice</option><option>Bob</option></select></div>
    </div>
    <div class="row">
      <div class="field"><label>開始日</label><input type="date" /></div>
      <div class="field"><label>期限日</label><input type="date" /></div>
    </div>
    <div class="field"><label>説明</label><textarea placeholder="タスクの詳細を入力..."></textarea></div>
    <div class="actions">
      <button type="button">キャンセル</button>
      <button class="primary" type="submit">保存</button>
    </div>
  </form>
</div>
</div>

- **操作方法**
  - **保存**: 必須項目を入力し「保存」を押下するとタスクが保存され、Gitコミットが作成されます。
  - **キャンセル**: 変更を破棄してモーダルを閉じます。

### ガントチャートページ

- **ページ概要**
  選択中のプロジェクトのスケジュールをガントチャート形式で可視化します。URLは `/projects/<encoded-name>/gantts` です。
  メニューバーには「プロジェクト管理」「タスク一覧」「ガントチャート」（アクティブ）「プロジェクト設定」とプロジェクト選択ドロップダウン、Undo/Redoボタンが表示されます。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
<style>
.gantt-page { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.gantt-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; align-items: center; }
.gantt-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.gantt-nav a.active { background: #007bff; color: white; }
.gantt-nav .spacer { flex: 1; }
.gantt-nav select { padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
.gantt-nav .undo-redo { display: flex; gap: 5px; }
.gantt-nav .undo-redo button { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 0.9em; }
.gantt-page header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
.gantt-page h1 { margin: 0; color: #444; }
.gantt-page .controls { display: flex; gap: 10px; align-items: center; }
.gantt-page button { cursor: pointer; padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; background: white; }
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
  <nav class="gantt-nav">
    <a href="#">プロジェクト管理</a>
    <a href="#">タスク一覧</a>
    <a href="#" class="active">ガントチャート</a>
    <a href="#">プロジェクト設定</a>
    <span class="spacer"></span>
    <select><option>新製品開発プロジェクト</option></select>
    <span class="undo-redo"><button>↩ Undo</button><button>↪ Redo</button></span>
  </nav>
  <header>
    <h1>ガントチャート</h1>
    <div class="controls">
      <button>拡大</button>
      <button>縮小</button>
      <label><input type="checkbox" /> イナズマ線表示</label>
    </div>
  </header>
  <div class="gantt-container" style="min-height: 200px">
    <div class="timeline-header">
      <span>1/1</span><span>1/2</span><span>1/3</span><span>1/4</span><span>1/5</span><span>1/6</span><span>1/7</span>
    </div>
    <div class="gantt-bars">
      <div class="bar-row">
        <div class="label">タスク A</div>
        <div class="bar-group">
          <div class="bar planned" style="left: 0; width: 150px;" title="予定: 1/1 - 1/3"></div>
          <div class="bar actual" style="left: 0; width: 50px;" title="実績: 1/1"></div>
        </div>
      </div>
      <div class="bar-row">
        <div class="label">タスク B</div>
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
  - **順序変更**: 左側のタスク行をドラッグ＆ドロップして並べ替えられます。
  - **表示切替**: ズーム操作やイナズマ線の表示/非表示を切り替えられます。

### プロジェクト設定ページ

- **ページ概要**
  選択中のプロジェクト固有の設定（基本設定の上書き値やメタデータ）を変更・保存する画面です。URLは `/projects/<encoded-name>/settings` です。変更はGitにコミットされます。
  メニューバーには「プロジェクト管理」「タスク一覧」「ガントチャート」「プロジェクト設定」（アクティブ）とプロジェクト選択ドロップダウン、Undo/Redoボタンが表示されます。

- **ページ内容**
<div style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif; color: #333;">
<style>
.proj-settings-page { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.proj-settings-page h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; color: #444; margin-top: 0; }
.proj-settings-nav { display: flex; gap: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 4px; margin-bottom: 20px; align-items: center; }
.proj-settings-nav a { text-decoration: none; color: #666; padding: 5px 10px; border-radius: 4px; }
.proj-settings-nav a.active { background: #007bff; color: white; }
.proj-settings-nav .spacer { flex: 1; }
.proj-settings-nav select { padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
.proj-settings-page .form-group { margin-bottom: 20px; }
.proj-settings-page label { display: block; margin-bottom: 5px; font-weight: bold; }
.proj-settings-page input[type="text"], .proj-settings-page input[type="number"] { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; max-width: 300px; }
.proj-settings-page button { cursor: pointer; padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: white; }
.proj-settings-page button.primary { background-color: #007bff; color: white; border: none; }
</style>
<div class="proj-settings-page">
  <nav class="proj-settings-nav">
    <a href="#">プロジェクト管理</a>
    <a href="#">タスク一覧</a>
    <a href="#">ガントチャート</a>
    <a href="#" class="active">プロジェクト設定</a>
    <span class="spacer"></span>
    <select><option>新製品開発プロジェクト</option></select>
  </nav>
  <h1>プロジェクト設定: 新製品開発プロジェクト</h1>
  <section>
    <h2 style="font-size: 1.1em; color: #666;">基本設定の上書き</h2>
    <p style="color: #888; font-size: 0.9em;">※ 空欄の項目はグローバル基本設定の値が使用されます。</p>
    <div class="form-group">
      <label>1日あたりの投入時間（上書き）</label>
      <input type="number" placeholder="グローバル設定: 8.0" />
    </div>
  </section>
  <button class="primary">保存</button>
</div>
</div>

- **操作方法**
  - **設定変更**: オーバーライド値を入力し「保存」ボタンを押下すると、`data/<プロジェクト名>/setting.json`が更新され、Gitコミットが作成されます。
