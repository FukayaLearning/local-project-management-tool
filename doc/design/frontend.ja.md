# フロントエンド設計書

## 1. 概要

本書は「Local Project Management Tool」のフロントエンド設計書です。
React + TypeScriptを用いたSPA (Single Page Application) として実装し、DDD (Domain-Driven Design) ライクなレイヤードアーキテクチャを採用します。

## 2. 全体方針

### 2.1 アーキテクチャ

`coding.md` の規定に従い、以下のディレクトリ構成と責務分担とします。

```
frontend/src/
├── domain/                  # [ドメイン層] ビジネスロジックと型定義
│   ├── entities/            # 【Entity】Task, Settings, ProjectSettingsなど
│   ├── repositories/        # 【Repository Interface】ITaskRepository, ISettingsRepository
│   └── services/            # 【Domain Service】（必要に応じて）
│
├── infrastructure/          # [インフラ層] 外部通信の実装
│   ├── api/                 # APIクライアント
│   │   ├── client.ts        # fetchラッパー
│   │   └── repositories/    # Repositoryの実装 (TaskApiRepository, SettingsApiRepository)
│   └── dtos/                # APIレスポンス等の型定義 (Domain Entityへの変換前)
│
├── application/             # [アプリケーション層] ユースケース (Custom Hooks)
│   └── usecases/            # useTaskUseCase, useSettingsUseCase
│
├── presentation/            # [プレゼンテーション層] UIコンポーネント
│   ├── components/          # 共通UI部品 (Button, Input, Modal, etc.)
│   ├── styles/              # グローバルスタイル (index.css)
│   └── pages/               # ページコンポーネント (Page/View)
│       ├── SettingsPage/
│       └── TaskListPage/
│
└── main.tsx                 # エントリーポイント
```

### 2.2 技術スタック

- **言語**: TypeScript
- **フレームワーク**: React (Vite)
- **スタイリング**: TailwindCSS (プロジェクト標準に準拠) または CSS Modules
- **状態管理**: React Context + Custom Hooks (局所的な状態はuseState)
- **ルーティング**: React Router (必要に応じて。今回は単一ページまたはタブ切り替え等の簡易な構成も視野だが、拡張性を考慮しRouter導入を推奨)

## 3. コンポーネント設計

### 3.1 共通コンポーネント (`presentation/components`)

- `Button`: ボタン (Primary, Secondary, Danger)
- `Input`: テキスト入力
- `Select`: ドロップダウン
- `Modal`: 汎用モーダルダイアログ
- `Card`: 枠付きコンテナ

### 3.2 設定画面 (`presentation/pages/SettingsPage`)

`SettingsUseCase` を使用してデータを取得・更新します。

- `SettingsPage`: ルートコンポーネント。データのロードと保存処理を統括。
  - `ProjectSettingsForm`: プロジェクト名、期間の設定フォーム。
  - `BasicSettingsForm`: タスクステータス、休日の設定フォーム（今回は表示のみまたは簡易編集）。

### 3.3 タスク一覧画面 (`presentation/pages/TaskListPage`)

`TaskUseCase` を使用してタスク操作を行います。

- `TaskListPage`: ルートコンポーネント。
  - `TaskToolbar`: 新規作成ボタン、フィルタリング、表示切り替え (List/Gantt)。
  - `TaskListView`: テーブル形式でのタスク一覧表示。
    - `TaskRow`: 各タスクの行。編集・削除アクションを含む。
  - `GanttChartView`: ガントチャート形式での表示。
    - `GanttBar`: タスクの期間を示すバー。
  - `TaskDetailModal`: タスクの新規作成・編集用モーダル。
    - `TaskForm`: タイトル、担当者、期間などの入力フォーム。

### 3.4 共通レイアウト (`presentation/components/Layout`)

- `AppLayout`: 全画面共通のラッパーコンポーネント。
- `MenuBar`: ヘッダー部分。ロゴ、画面遷移リンク、プロジェクト選択ドロップダウンを含む。
  - 画面遷移: 「タスク一覧」「ガントチャート」
  - プロジェクト選択: APIから取得したプロジェクト一覧を表示し、変更時に `useProject` フックを通じてアクティブなプロジェクトを切り替える。
  - Undo/Redo: 「Undo」「Redo」ボタンを配置し、APIをコールして変更を取り消し・やり直しする。

### 3.5 新規プロジェクト作成画面 (`presentation/pages/ProjectCreatePage`)

初期化未済の場合、またはユーザーが新規作成を選択した場合に表示されます。

- `ProjectCreatePage`: プロジェクト名入力フォームを提供。
  - `ProjectNameInput`: プロジェクト名を入力。
  - `CreateButton`: 作成を実行。成功時はタスク一覧へ遷移。

## 4. データ・状態管理

### 4.1 アプリケーション状態 (Application State)

Redux等の大規模なStoreは使用せず、Custom Hooks (`useTaskUseCase` 等) が返す状態 (`data`, `isLoading`, `error`) を各ページのルートコンポーネントで受け取り、子コンポーネントにPropsとして渡す方針とします。

### 4.2 API連携 (Infrastructure)

- **Repository Pattern**: `infrastructure/api/repositories` 内で `fetch` または `axios` を用いてバックエンドAPIをコールします。
- **DTO -> Entity変換**: APIからのレスポンス(JSON)を、ドメイン層で定義されたEntityクラス/インターフェースに変換してアプリケーション層に返します。

### 4.3 初期化フローとルーティング

1. アプリケーション起動時 (`App.tsx`) に `GET /system/status` をコールし、初期化状態を確認します。
2. 未初期化またはデフォルトプロジェクト未設定の場合、`/create-project` (ProjectCreatePage) へリダイレクトします。
3. 初期化済みの場合、`/tasks` (TaskListPage) へ遷移します。

## 5. エラーハンドリング

- API呼び出しのエラーは `usecases` でキャッチし、エラー状態 (`error: Error | null`) としてコンポーネントに通知します。
- 画面上では `Toast` またはエラーメッセージ表示エリアを用いてユーザーに通知します。
