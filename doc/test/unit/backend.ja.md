# バックエンド単体試験仕様書

## 1. テスト方針

- **ツール**: `pytest`
- **対象**:
  - **Domain Layer** (Entities): バリデーションロジックなど
  - **Application Layer** (UseCases): ビジネスロジック、リポジトリ・各種サービス呼び出し
    - **Dependency Injection**: `dependency-injector` または手動のコンストラクタ注入により、インターフェースを介した依存関係を解決する。
  - **Presentation Layer** (Schemas): 入力データの型チェック
- **Mock化**:
  - `Infrastructure Layer` (Repository, GitService, FileSystem) はMockを使用し、テストの独立性と速度を確保する。
  - ユニットテストでは、UseCase のコンストラクタに Mock インスタンスを直接注入することで、インフラ層への依存を完全に排除する。

## 2. API/ロジック別テスト仕様

### 2.1 SettingsUseCase

- **対象クラス**: `backend.app.application.usecases.settings_usecase.SettingsUseCase`
- **関連Spec-ID**: `SPEC-CNFG-***`

| Test-ID                  | テスト概要           | 入力データ                          | Mock挙動                                                         | 期待値/振る舞い                                           | 結果 |
| :----------------------- | :------------------- | :---------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------- | :--- |
| **UNIT-BE-SETTINGS-001** | グローバル設定取得   | なし                                | Repo.get_global_settings() -> GlobalSettings                     | Global Settingsが返ること                                 | PASS |
| **UNIT-BE-SETTINGS-002** | グローバル設定更新   | `SettingsUpdateDTO`                 | Repo.save_global_settings() -> Success                           | Repo.save_global_settingsが1回呼ばれること                | PASS |
| **UNIT-BE-SETTINGS-003** | プロジェクト設定取得 | `project_name`                      | Repo.get_project_settings() -> ProjectSettings                   | Project Settingsが返ること                                | PASS |
| **UNIT-BE-SETTINGS-004** | プロジェクト設定更新 | `project_name`, `SettingsUpdateDTO` | Repo.save_project_settings() -> Success, Git.commit() -> Success | Repo.save_project_settingsとGit.commitが各1回呼ばれること | PASS |

### 2.2 TaskUseCase

- **対象クラス**: `backend.app.application.usecases.task_usecase.TaskUseCase`
- **関連Spec-ID**: `SPEC-TASK-***`, `SPEC-HIST-***`

| Test-ID              | テスト概要               | 入力データ                                      | Mock挙動                                                                 | 期待値/振る舞い                                                                   | 結果 |
| :------------------- | :----------------------- | :---------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------- | :--- |
| **UNIT-BE-TASK-001** | タスク一覧取得           | `project_name`                                  | Repo.get_all() -> [Task1, Task2]                                         | Taskエンティティのリストが返ること                                                | PASS |
| **UNIT-BE-TASK-002** | タスク作成               | `project_name`, `TaskCreateDTO`                 | Repo.save() -> Task(id=uuid), Git.commit() -> Success                    | Repo.saveとGit.commitが呼ばれ、生成されたTaskが返ること。IDが採番されていること。 | PASS |
| **UNIT-BE-TASK-003** | タスク更新               | `project_name`, `task_id`, `TaskUpdateDTO`      | Repo.get_by_id() -> Task, Repo.update() -> Task, Git.commit() -> Success | Repo.updateとGit.commitが呼ばれ、ステータスが更新されていること。                 | PASS |
| **UNIT-BE-TASK-004** | タスク更新(存在しないID) | `project_name`, `invalid_id`, `DTO`             | Repo.get_by_id() -> None                                                 | `None` が返り、Repo.updateとGit.commitは呼ばれないこと。                          | PASS |
| **UNIT-BE-TASK-005** | タスク削除               | `project_name`, `task_id`                       | Repo.delete() -> True, Git.commit() -> Success                           | Repo.deleteとGit.commitが呼ばれ、Trueが返ること。                                 | PASS |
| **UNIT-BE-TASK-006** | タスク作成(親タスク指定) | `project_name`, `TaskCreateDTO(parent_id="P1")` | Repo.save() -> Task, Git.commit() -> Success                             | 親タスクID(parent_id)が設定された状態でタスクが生成・保存されること。             | PASS |
| **UNIT-BE-TASK-007** | タスク順序変更           | `project_name`, `List[TaskOrderUpdateDTO]`      | Repo.update_orders() -> True, Git.commit() -> Success                    | Repo.update_ordersとGit.commitが呼ばれ、Trueが返ること。                          | PASS |

### 2.3 ProjectUseCase

- **対象クラス**: `backend.app.application.usecases.project_usecase.ProjectUseCase`
- **関連Spec-ID**: `SPEC-INIT-***`

| Test-ID                 | テスト概要           | 入力データ                 | Mock挙動                                      | 期待値/振る舞い                                                         | 結果 |
| :---------------------- | :------------------- | :------------------------- | :-------------------------------------------- | :---------------------------------------------------------------------- | :--- |
| **UNIT-BE-PROJECT-001** | プロジェクト一覧取得 | なし                       | FileSystem.list_directories() -> ["p1", "p2"] | プロジェクト名のリストが返ること                                        | PASS |
| **UNIT-BE-PROJECT-002** | プロジェクト作成     | `project_name="new-proj"`  | Git.is_repo() -> False                        | Git.init, settings_repo.save_project_settings, Git.commitが呼ばれること | PASS |
| **UNIT-BE-PROJECT-003** | Undo                 | `project_name="project-a"` | Git.undo() -> "Undo successful"               | Git.undoが呼ばれ、結果文字列が返ること                                  | PASS |
| **UNIT-BE-PROJECT-004** | Redo                 | `project_name="project-a"` | Git.redo() -> "Redo successful"               | Git.redoが呼ばれ、結果文字列が返ること                                  | PASS |

### 2.4 Domain Entities

- **対象クラス**: `backend.app.domain.entities.task.Task`

| Test-ID                | テスト概要 | 入力データ   | 期待値/振る舞い                                                    | 結果 |
| :--------------------- | :--------- | :----------- | :----------------------------------------------------------------- | :--- |
| **UNIT-BE-ENTITY-001** | Task初期化 | 必須項目のみ | IDが自動生成され、Optional項目はNoneまたはデフォルト値になること。 | PASS |
