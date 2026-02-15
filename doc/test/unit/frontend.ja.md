# フロントエンド単体試験仕様書

## 1. テスト方針
* **ツール**: Vitest, React Testing Library
* **網羅基準**:
  * 主要なUIコンポーネント（Button, Input, Select, Modal）のレンダリングとイベントハンドリング
  * ユースケース（useTaskUseCase, useSettingsUseCase）の状態管理とAPI呼び出し
  * ページコンポーネント（TaskDetailModal, ProjectSettingsForm）のフォーム動作

## 2. コンポーネント別テスト仕様

### 2.1 共通コンポーネント

| コンポーネント | Test-ID | テスト概要 | 期待値/振る舞い |
| :--- | :--- | :--- | :--- |
| **Button** | UNIT-FE-BTN-001 | 初期表示確認 | 指定したバリアント、サイズでボタンが表示されること |
| | UNIT-FE-BTN-002 | クリックイベント | クリック時にonClickハンドラが呼び出されること |
| | UNIT-FE-BTN-003 | 非活性状態 | disabledプロパティでボタンが無効化されること |
| **Input** | UNIT-FE-INP-001 | 初期表示確認 | ラベルと入力欄が表示されること |
| | UNIT-FE-INP-002 | エラー表示 | エラーメッセージが赤字で表示されること |
| **Select** | UNIT-FE-SEL-001 | 初期表示確認 | 指定したオプションが表示され、選択可能であること |

### 2.2 ユースケース (Application Layer)

| フック | Test-ID | テスト概要 | 期待値/振る舞い |
| :--- | :--- | :--- | :--- |
| **useTaskUseCase** | UNIT-FE-UC-TASK-001 | タスク取得成功 | APIから取得したタスクがstateに反映されること |
| | UNIT-FE-UC-TASK-002 | タスク取得失敗 | エラーstateが更新されること |
| | UNIT-FE-UC-TASK-003 | タスク作成成功 | 新規作成されたタスクがリストに追加されること |
| **useSettingsUseCase** | UNIT-FE-UC-SET-001 | 設定取得成功 | プロジェクト設定がstateに反映されること |
| | UNIT-FE-UC-SET-002 | 設定更新成功 | 更新後の設定がstateに反映されること |

### 2.3 ページコンポーネント

| コンポーネント | Test-ID | テスト概要 | 期待値/振る舞い |
| :--- | :--- | :--- | :--- |
| **TaskDetailModal** | UNIT-FE-PG-TDM-001 | 新規作成モード表示 | 空のフォームが表示されること |
| | UNIT-FE-PG-TDM-002 | 編集モード表示 | 既存タスクの情報がフォームに入力されていること |
| | UNIT-FE-PG-TDM-003 | 保存処理 | 入力内容でonSaveが呼び出されること |
| **ProjectSettingsForm** | UNIT-FE-PG-PSF-001 | 初期表示確認 | 現在の設定値がフォームに入力されていること |
| | UNIT-FE-PG-PSF-002 | 保存処理 | 変更された内容でonSaveが呼び出されること |
| | UNIT-FE-PG-PSF-003 | バリデーション | 必須項目が空の場合、保存ボタンが無効化されること |
