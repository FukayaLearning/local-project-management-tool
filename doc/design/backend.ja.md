# バックエンド設計書

## 1. 概要

本書は「Local Project Management Tool」のバックエンド設計書です。
FastAPIを用いたAPIサーバーの内部設計、特にDDD (Domain-Driven Design) に基づくアーキテクチャと、各APIの処理フローについて記述します。

## 2. 全体方針

### 2.1 アーキテクチャ

Layered Architecture (UI/Application/Domain/Infrastructure) を採用し、関心事の分離を図ります。

```
backend/app/
├── domain/                  # [ドメイン層] ビジネスロジックの中核（外部依存なし）
│   ├── entities/            # 【Entity】Task, Settings, ProjectSettings など
│   ├── repositories/        # 【Repository Interface】ITaskRepository, ISettingsRepository, IGitRepository
│   └── services/            # 【Domain Service】複数エンティティにまたがるロジック
│
├── application/             # [アプリケーション層] ユースケース
│   └── usecases/            # 【UseCase】TaskUseCase, SettingsUseCase, ProjectUseCase
│
├── infrastructure/          # [インフラ層] 技術的な詳細実装
│   ├── file_system/         # JSON/CSV読み書き実装 (TaskFileRepository, SettingsFileRepository)
│   └── git/                 # Git操作実装 (GitService)
│
├── presentation/            # [プレゼンテーション層] APIエンドポイント
│   └── api/
│       └── v1/
│           ├── endpoints/   # ルータ定義 (projects.py, tasks.py, settings.py)
│           └── schemas/     # 【Schema】Pydanticモデル（リクエスト/レスポンス）
│
├── container.py             # DI設定
└── main.py                  # アプリ起動
```

### 2.2 共通処理

- **エラーハンドリング**: グローバル例外ハンドラにより、ドメイン例外を適切なHTTPステータスコードとJSONレスポンスに変換します。
- **DI (Dependency Injection)**: `container.py` にて、Repositoryの実装クラスをUseCaseに注入します。Gitリポジトリの操作はプロジェクトごとにデータディレクトリが異なるため、各UseCase呼び出し時にプロジェクト名を受け取り、対象ディレクトリを動的に決定します。
- **スレッドセーフティ**: Git操作は `threading.Lock` で排他制御し、同時アクセス時のデータ不整合を防ぎます。

## 3. データモデル設計

### 3.1 エンティティ/値オブジェクト (Domain)

- `Task`: ID, Title, Status, Dates, ParentID, display_order, planned_hours, actual_hours, progress 等を保持。Pydanticの `ConfigDict(extra='allow')` を指定し、CSVの未定義カラムを動的に保持する。
- `BasicSettings`: タスク状態定義、タスク種別定義、担当者定義、1日投入時間、休日定義を保持。グローバル設定。
- `ProjectSettings`: プロジェクト名、基本設定のオーバーライド値を保持。

### 3.2 データストア (Infrastructure)

- `data/setting.json`: グローバル基本設定。Git管理対象外。
- `data/<プロジェクト名>/setting.json`: プロジェクト固有設定。Git管理対象。
- `data/<プロジェクト名>/tasks.csv`: プロジェクト固有タスクデータ。Pandas DataFrameを用いて読み書き。Git管理対象。

### 3.3 ディレクトリ管理

- `data/` をルートとし、各プロジェクトはサブディレクトリとして管理される。
- プロジェクト一覧は `data/` 配下のディレクトリ一覧（`.`で始まるものを除く）から取得する。
- 各プロジェクトディレクトリは独立したGitリポジトリ（`.git/`）を持つ。

## 4. APIロジック詳細

### 4.1 グローバル基本設定 (Settings)

#### `GET /api/v1/settings`

- **関連Spec-ID**: `SPEC-CNFG-001-001`, `SPEC-CNFG-001-003`
- **処理フロー**:
  1. `SettingsUseCase.get_global_settings()` を呼び出す。
  2. `SettingsFileRepository` 経由で `data/setting.json` を読み込む。
  3. `BasicSettings` エンティティを返却する。

#### `PUT /api/v1/settings`

- **関連Spec-ID**: `SPEC-CNFG-001-001`, `SPEC-CNFG-001-003`
- **処理フロー**:
  1. `SettingsUseCase.update_global_settings(dto)` を呼び出す。
  2. `SettingsFileRepository` 経由で `data/setting.json` を更新する。
  3. ※Git管理対象外のため、コミットは行わない。

### 4.2 プロジェクト管理 (Projects)

#### `GET /api/v1/projects`

- **関連Spec-ID**: `SPEC-PROJ-001-001`
- **処理フロー**:
  1. `ProjectUseCase.list_projects()` を呼び出す。
  2. `data/` ディレクトリの子ディレクトリ一覧を取得する（`.`始まりを除外）。
  3. プロジェクト名のリスト `List[str]` を返却する。

#### `POST /api/v1/projects`

- **関連Spec-ID**: `SPEC-PROJ-002-001`, `SPEC-PROJ-002-002`, `SPEC-PROJ-003-001`
- **処理フロー**:
  1. `ProjectUseCase.create_project(project_name)` を呼び出す。
  2. **バリデーション**:
     - プロジェクト名が空（トリム後）→ HTTP 400
     - OS禁止文字を含む → HTTP 400
     - 既存プロジェクトと重複 → HTTP 400
  3. `data/<project_name>/` ディレクトリを作成。
  4. `data/<project_name>/setting.json` に初期プロジェクト設定を書き込む。
  5. `data/<project_name>/tasks.csv` に空のCSVヘッダを書き込む。
  6. `GitService.initialize(data/<project_name>/)` でGitリポジトリを初期化。
  7. **Git Commit**: `GitService.commit("Initial commit")` を実行。

#### `GET /api/v1/projects/{project_name}/settings`

- **関連Spec-ID**: `SPEC-CNFG-002-001`, `SPEC-CNFG-002-003`
- **処理フロー**:
  1. `SettingsUseCase.get_project_settings(project_name)` を呼び出す。
  2. `data/<project_name>/setting.json` を読み込む。
  3. `ProjectSettings` エンティティを返却する。

#### `PUT /api/v1/projects/{project_name}/settings`

- **関連Spec-ID**: `SPEC-CNFG-002-002`, `SPEC-CNFG-002-003`, `SPEC-HIST-001-001`
- **処理フロー**:
  1. `SettingsUseCase.update_project_settings(project_name, dto)` を呼び出す。
  2. `data/<project_name>/setting.json` を更新する。
  3. **Git Commit**: `GitService.commit("Update project settings", data/<project_name>/)` を実行。

#### `POST /api/v1/projects/{project_name}/undo`

- **関連Spec-ID**: `SPEC-HIST-003-001`, `SPEC-HIST-003-002`
- **処理フロー**:
  1. `ProjectUseCase.undo(project_name)` を呼び出す。
  2. `GitService.undo(data/<project_name>/)` で `git reset --hard HEAD^` を実行。
  3. 初期コミットしかない場合はHTTP 400エラーを返す。

#### `POST /api/v1/projects/{project_name}/redo`

- **関連Spec-ID**: `SPEC-HIST-003-001`, `SPEC-HIST-003-003`
- **処理フロー**:
  1. `ProjectUseCase.redo(project_name)` を呼び出す。
  2. `GitService.redo(data/<project_name>/)` でReflogを使用してRedo操作を実行。
  3. Redo可能なコミットがない場合はHTTP 400エラーを返す。

### 4.3 タスク管理 (Tasks)

#### `GET /api/v1/projects/{project_name}/tasks`

- **関連Spec-ID**: `SPEC-TASK-001-001`, `SPEC-PROJ-005-001`, `SPEC-HIST-002-001`
- **処理フロー**:
  1. `TaskUseCase.list_tasks(project_name)` を呼び出す。
  2. **外部変更検知**: プロジェクトのGitリポジトリに未コミット変更があれば `GitService.commit("Manual change detected during runtime")` を実行。
  3. **Git自動初期化**: Gitリポジトリが存在しない場合、初期化と初期コミットを行う。
  4. `TaskRepository` がCSV `data/<project_name>/tasks.csv` を読み込み、`List[Task]` を返却する。
  5. 階層構造の構築はフロントエンドに委譲するため、フラットなリストとして返す。

#### `POST /api/v1/projects/{project_name}/tasks`

- **関連Spec-ID**: `SPEC-TASK-002-002`, `SPEC-TASK-002-003`, `SPEC-HIST-001-001`
- **処理フロー**:
  1. `TaskUseCase.create_task(project_name, dto)` を呼び出す。
  2. **ID採番**: UUID v4 を生成。
  3. `Task` エンティティを生成し、`TaskRepository` で `data/<project_name>/tasks.csv` に保存(追記)する。
  4. **Git自動初期化**: リポジトリ未存在ならば初期化。
  5. **Git Commit**: `GitService.commit(f"Add task {title}")` を実行。

#### `PUT /api/v1/projects/{project_name}/tasks/{task_id}`

- **関連Spec-ID**: `SPEC-TASK-002-004`, `SPEC-HIST-001-001`
- **処理フロー**:
  1. `TaskUseCase.update_task(project_name, task_id, dto)` を呼び出す。
  2. `TaskRepository` で該当IDのレコードを更新する。
  3. **Git Commit**: `GitService.commit(f"Update task {title}")` を実行。

#### `PUT /api/v1/projects/{project_name}/tasks/reorder`

- **関連Spec-ID**: `SPEC-TASK-004-001`, `SPEC-HIST-001-001`
- **処理フロー**:
  1. `TaskUseCase.reorder_tasks(project_name, orders)` を呼び出す。
  2. `TaskRepository.update_orders(orders)` で複数タスクの順序を一括で更新・保存する。
  3. **Git Commit**: `GitService.commit("Reorder tasks")` を実行。

#### `PUT /api/v1/projects/{project_name}/tasks/bulk-update`

- **関連Spec-ID**: `SPEC-VIEW-004-002`, `SPEC-HIST-001-001`
- **処理フロー**:
  1. `TaskUseCase.bulk_update_tasks(project_name, updates)` を呼び出す。
  2. 渡されたIDリストに基づき、各タスクの `start_date`, `due_date` を一括更新する。
  3. 未定義フィールド（extra領域）が損なわれないようにリポジトリ経由で更新を保存する。
  4. **Git Commit**: `GitService.commit("Apply schedule to tasks")` を実行。

#### `DELETE /api/v1/projects/{project_name}/tasks/{task_id}`

- **関連Spec-ID**: `SPEC-TASK-002-005`, `SPEC-HIST-001-001`
- **処理フロー**:
  1. `TaskUseCase.delete_task(project_name, task_id)` を呼び出す。
  2. `TaskRepository` で該当IDのレコードを物理削除する。
  3. **Git Commit**: `GitService.commit(f"Delete task {task_id}")` を実行。

## 5. 外部連携 (Git管理)

### 5.1 Git連携

- **コンポーネント**: `infrastructure/git/GitService`
- **特徴**: プロジェクトごとに独立したGitリポジトリを操作する。`data_dir` パラメータでプロジェクトディレクトリを受け取り、そのディレクトリ内での操作を行う。
- **スレッドセーフティ**: `threading.Lock` により、同時アクセス時の排他制御を行う。
- **メソッド**:
  - `initialize(project_dir: str)`: `git init -b main` でGitリポジトリを初期化
  - `is_initialized(project_dir: str) -> bool`: `.git` ディレクトリの存在確認
  - `commit(message: str, project_dir: str)`: `git add .` && `git commit -m message`
  - `has_uncommitted_changes(project_dir: str) -> bool`: `git status --porcelain` が空でないか確認
  - `undo(project_dir: str)`: `git reset --hard HEAD^`
  - `redo(project_dir: str)`: `git reflog` を参照してredo操作

### 5.2 外部変更同期ロジック

- **検知タイミング**: `GET /api/v1/projects/{project_name}/tasks` 等のデータ読み込みAPI実行時。
- **処理内容**: プロジェクトのGitリポジトリに未コミット変更があれば自動でコミットする。
- **Git自動初期化**: タスクデータ変更時にリポジトリが存在しない場合、変更前の状態でGit初期化と初期コミットを行った後に変更をコミットする。

## 6. セキュリティ・非機能要件

- **CORS設定**: フロントエンドからのリクエストを許可するため、CORS設定を行う。
- **パフォーマンス**: CSVファイルの読み書きはPandasを利用し、ファイルサイズが大きくなった場合のパフォーマンス劣化に注意する。
- **エラーリカバリ**: Git操作失敗時は適切なエラーメッセージをログに出力し、APIレスポンスで通知する。
