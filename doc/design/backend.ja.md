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
│   ├── entities/            # 【Entity】Task, Settingsなど
│   ├── repositories/        # 【Repository Interface】ITaskRepository, ISettingsRepository
│   └── services/            # 【Domain Service】複数エンティティにまたがるロジック
│
├── application/             # [アプリケーション層] ユースケース
│   ├── usecases/            # 【UseCase】TaskUseCase, SettingsUseCase (Gitコミット制御も含む)
│   └── dtos/                # 【DTO】データ転送用オブジェクト (Pydanticから変換)
│
├── infrastructure/          # [インフラ層] 技術的な詳細実装
│   ├── file_system/         # JSON/CSV読み書き実装 (TaskFileRepository, SettingsFileRepository)
│   └── git/                 # Git操作実装 (GitService)
│
├── presentation/            # [プレゼンテーション層] APIエンドポイント
│   └── api/
│       └── v1/
│           ├── endpoints/   # ルータ定義
│           └── schemas/     # 【Schema】Pydanticモデル（リクエスト/レスポンス）
│
└── main.py                  # DI設定・アプリ起動
```

### 2.2 共通処理
*   **エラーハンドリング**: グローバル例外ハンドラにより、ドメイン例外を適切なHTTPステータスコードとJSONレスポンスに変換します。
*   **DI (Dependency Injection)**: `main.py` または `dependencies.py` にて、Repositoryの実装クラスをUseCaseに注入します。

## 3. データモデル設計

### 3.1 エンティティ/値オブジェクト (Domain)
*   `Task`: ID, Title, Status, Dates, ParentID などを保持。
*   `ProjectSettings`: プロジェクト名、期間などを保持。
*   `BasicSettings`: ステータス定義、担当者定義などを保持。

### 3.2 データストア (Infrastructure)
*   `data/settings.json`: System Setting, Project Setting をマージして保存・読み込み。
*   `data/tasks.csv`: Pandas DataFrameを用いて読み書き。CSVヘッダはSystem Settingの定義に従う。

## 4. APIロジック詳細

### 4.1 プロジェクト設定 (Projects)

#### `GET /projects/settings`
*   **関連Spec-ID**: `SPEC-CNFG-001-001`, `SPEC-CNFG-002-001`
*   **処理フロー**:
    1.  `SettingsUseCase.get_settings()` を呼び出す。
    2.  `SettingsFileRepository` 経由で JSON ファイルを読み込む。
    3.  `ProjectSettings` エンティティを返却する。

#### `PUT /projects/settings`
*   **関連Spec-ID**: `SPEC-CNFG-002-002`, `SPEC-HIST-001-001`
*   **処理フロー**:
    1.  `SettingsUseCase.update_settings(dto)` を呼び出す。
    2.  `SettingsFileRepository` 経由で JSON ファイルを更新する。
    3.  **Git Commit**: `GitService.commit("Update project settings")` を実行する。

### 4.2 タスク管理 (Tasks)

#### `GET /tasks`
*   **関連Spec-ID**: `SPEC-TASK-001-001`
*   **処理フロー**:
    1.  `TaskUseCase.list_tasks(filter)` を呼び出す。
    2.  `TaskRepository` (Pandas) がCSVを読み込み、`List[Task]` を返却する。
    3.  階層構造の構築はフロントエンドに委譲するため、フラットなリストとして返す。

#### `POST /tasks`
*   **関連Spec-ID**: `SPEC-TASK-002-002`, `SPEC-HIST-001-001`
*   **処理フロー**:
    1.  `TaskUseCase.create_task(dto)` を呼び出す。
    2.  **ID採番**: UUID v4 を生成。
    3.  `Task` エンティティを生成し、`TaskRepository` で保存(追記)する。
    4.  **Git Commit**: `GitService.commit(f"Add task {title}")` を実行する。

#### `PUT /tasks/{id}`
*   **関連Spec-ID**: `SPEC-TASK-002-001`, `SPEC-HIST-001-001`
*   **処理フロー**:
    1.  `TaskUseCase.update_task(id, dto)` を呼び出す。
    2.  `TaskRepository` で該当IDのレコードを更新する。
    3.  **Git Commit**: `GitService.commit(f"Update task {title}")` を実行する。

#### `DELETE /tasks/{id}`
*   **処理フロー**:
    1.  `TaskUseCase.delete_task(id)` を呼び出す。
    2.  `TaskRepository` で該当IDのレコードを物理削除（または論理削除フラグ更新）する。
    3.  **Git Commit**: `GitService.commit(f"Delete task {id}")` を実行する。

## 5. 外部連携 (History Management)

### Git連携
*   **コンポーネント**: `infrastructure/git/GitService`
*   **機能**: Pythonの `subprocess` または `GitPython` ライブラリを使用。
*   **メソッド**:
    *   `commit(message: str)`: `git add .` && `git commit -m message`
    *   `restore(commit_hash: str)`: `git restore --source commit_hash .` (※要詳細検討: 現在のワークスペースを上書きする挙動)
