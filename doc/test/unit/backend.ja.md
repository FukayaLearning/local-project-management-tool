# バックエンド単体試験仕様書

## 1. テスト方針
*   **ツール**: `pytest`
*   **対象**:
    *   **Domain Layer** (Entities): バリデーションロジックなど
    *   **Application Layer** (UseCases): ビジネスロジック、リポジトリ呼び出し、Git連携
    *   **Presentation Layer** (Schemas): 入力データの型チェック
*   **Mock化**:
    *   `Infrastructure Layer` (Repository, GitService, FileSystem) はMockを使用し、テストの独立性と速度を確保する。
    *   インフラ層自体のテストは、結合試験にてカバーする（または別途Integration Testとして実施）。

## 2. API/ロジック別テスト仕様

### 2.1 SettingsUseCase
*   **対象クラス**: `backend.app.application.usecases.settings_usecase.SettingsUseCase`
*   **関連Spec-ID**: `SPEC-CNFG-***`

| Test-ID | テスト概要 | 入力データ | Mock挙動 | 期待値/振る舞い |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-BE-SETTINGS-001** | プロジェクト設定取得 | なし | Repo.get_settings() -> Default Settings | Default Project Nameが返ること |
| **UNIT-BE-SETTINGS-002** | プロジェクト設定更新 | `SettingsUpdateDTO(project_name="New Name")` | Repo.save_settings() -> Success, Git.commit() -> Success | Repo.saveとGit.commitが各1回呼ばれること |

### 2.2 TaskUseCase
*   **対象クラス**: `backend.app.application.usecases.task_usecase.TaskUseCase`
*   **関連Spec-ID**: `SPEC-TASK-***`, `SPEC-HIST-***`

| Test-ID | テスト概要 | 入力データ | Mock挙動 | 期待値/振る舞い |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-BE-TASK-001** | タスク一覧取得 | なし | Repo.get_all() -> [Task1, Task2] | Taskエンティティのリストが返ること |
| **UNIT-BE-TASK-002** | タスク作成 | `TaskCreateDTO(title="Task 1", status="New")` | Repo.save() -> Task(id=uuid), Git.commit() -> Success | Repo.saveとGit.commitが呼ばれ、生成されたTaskが返ること。IDが採番されていること。 |
| **UNIT-BE-TASK-003** | タスク更新 | `task_id`, `TaskUpdateDTO(status="Doing")` | Repo.get_by_id() -> Task, Repo.update() -> Task, Git.commit() -> Success | Repo.updateとGit.commitが呼ばれ、ステータスが更新されていること。 |
| **UNIT-BE-TASK-004** | タスク更新(存在しないID) | `invalid_id`, `DTO` | Repo.get_by_id() -> None | `None` が返り、Repo.updateとGit.commitは呼ばれないこと。 |
| **UNIT-BE-TASK-005** | タスク削除 | `task_id` | Repo.delete() -> True, Git.commit() -> Success | Repo.deleteとGit.commitが呼ばれ、Trueが返ること。 |

### 2.3 Domain Entities
*   **対象クラス**: `backend.app.domain.entities.task.Task`

| Test-ID | テスト概要 | 入力データ | 期待値/振る舞い |
| :--- | :--- | :--- | :--- |
| **UNIT-BE-ENTITY-001** | Task初期化 | 必須項目のみ | IDが自動生成され、Optional項目はNoneまたはデフォルト値になること。 |
