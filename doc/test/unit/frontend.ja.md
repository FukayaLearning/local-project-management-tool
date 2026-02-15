# フロントエンド単体試験仕様書

## 1. テスト方針
*   **ツール**: Vitest, React Testing Library
*   **網羅基準**:
    *   主要なロジック(UseCase)の正常系・異常系
    *   共通コンポーネント(Common Components)のレンダリングとイベントハンドリング
    *   ページコンポーネントの基本表示確認

## 2. コンポーネント別テスト仕様

### 2.1 共通コンポーネント (Common Components)

#### Button
*   **対象ファイル**: `frontend/src/presentation/components/Button.tsx`

| Test-ID | テスト概要 | 前提条件 | 入力・操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-BTN-001** | レンダリング確認(Primary) | なし | variant="primary" | primaryスタイルのボタンが表示されること |
| **UNIT-FE-BTN-002** | レンダリング確認(Secondary) | なし | variant="secondary" | secondaryスタイルのボタンが表示されること |
| **UNIT-FE-BTN-003** | レンダリング確認(Danger) | なし | variant="danger" | dangerスタイルのボタンが表示されること |
| **UNIT-FE-BTN-004** | クリックイベント | onClickハンドラ設定 | クリック | ハンドラが実行されること |
| **UNIT-FE-BTN-005** | 無効化状態 | disabled=true | クリック | ハンドラが実行されないこと |

#### Input
*   **対象ファイル**: `frontend/src/presentation/components/Input.tsx`

| Test-ID | テスト概要 | 前提条件 | 入力・操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-INP-001** | レンダリング確認 | labelあり | 表示 | ラベルと入力欄が表示されること |
| **UNIT-FE-INP-002** | 入力確認 | なし | 文字列入力 | onChangeイベントが発火し値が更新されること |
| **UNIT-FE-INP-003** | エラー表示 | error="Error Message" | 表示 | エラーメッセージが赤字で表示されること |

#### Select
*   **対象ファイル**: `frontend/src/presentation/components/Select.tsx`

| Test-ID | テスト概要 | 前提条件 | 入力・操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-SEL-001** | オプション表示 | options配列あり | 表示 | 指定したオプションが選択肢として表示されること |
| **UNIT-FE-SEL-002** | 選択変更 | なし | オプション変更 | onChangeイベントが発火し値が更新されること |

### 2.2 アプリケーション層 (UseCases)

#### useTaskUseCase
*   **対象ファイル**: `frontend/src/application/usecases/useTaskUseCase.ts`
*   **備考**: Repositoryはモック化してテストする

| Test-ID | テスト概要 | 前提条件 | 操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-UC-TASK-001** | タスク一覧取得(正常) | Repoがタスク配列を返却 | fetchTasks() | tasksステートにデータがセットされ、isLoadingがfalseになること |
| **UNIT-FE-UC-TASK-002** | タスク一覧取得(エラー) | Repoがエラーを送出 | fetchTasks() | errorステートにエラーがセットされ、isLoadingがfalseになること |
| **UNIT-FE-UC-TASK-003** | タスク作成(正常) | Repoが新規タスクを返却 | createTask() | tasksステートに新規タスクが追加されること |
| **UNIT-FE-UC-TASK-004** | タスク更新(正常) | Repoが更新タスクを返却 | updateTask() | tasksステートの該当タスクが更新されること |
| **UNIT-FE-UC-TASK-005** | タスク削除(正常) | Repoが正常終了 | deleteTask() | tasksステートから該当タスクが削除されること |

#### useSettingsUseCase
*   **対象ファイル**: `frontend/src/application/usecases/useSettingsUseCase.ts`

| Test-ID | テスト概要 | 前提条件 | 操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-UC-SET-001** | 設定取得(正常) | Repoが設定を返却 | fetchSettings() | settingsステートにデータがセットされること |
| **UNIT-FE-UC-SET-002** | プロジェクト設定更新 | Repoが更新データを返却 | updateProjectSettings() | settings.projectが更新されること |

### 2.3 ページ/機能コンポーネント

#### TaskDetailModal
*   **対象ファイル**: `frontend/src/presentation/pages/TaskListPage/components/TaskDetailModal.tsx`

| Test-ID | テスト概要 | 前提条件 | 入力・操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-MOD-TASK-001** | 新規作成モード表示 | task=null | 表示 | タイトルが"New Task"となり、入力欄が空であること |
| **UNIT-FE-MOD-TASK-002** | 編集モード表示 | taskオブジェクトあり | 表示 | タイトルが"Edit Task"となり、入力欄に値が入っていること |
| **UNIT-FE-MOD-TASK-003** | 保存処理 | 入力値あり | Saveボタン押下 | onSaveハンドラが入力値とともに呼ばれること |
| **UNIT-FE-MOD-TASK-004** | バリデーション | タイトル空 | Saveボタン押下 | 保存処理が走らないこと(HTML5バリデーション) |

#### ProjectSettingsForm
*   **対象ファイル**: `frontend/src/presentation/pages/SettingsPage/ProjectSettingsForm.tsx`

| Test-ID | テスト概要 | 前提条件 | 入力・操作 | 期待される結果 |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-FE-FRM-SET-001** | 初期値表示 | settingsあり | 表示 | プロジェクト名が入力欄にセットされていること |
| **UNIT-FE-FRM-SET-002** | 保存処理 | 名前変更 | Saveボタン押下 | onSaveハンドラが変更された値とともに呼ばれること |
