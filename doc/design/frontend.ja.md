# フロントエンド設計書

## 1. 概要

本書は「Local Project Management Tool」のフロントエンド設計書です。
React + TypeScriptを用いたSPA (Single Page Application) として実装し、DDD (Domain-Driven Design) ライクなレイヤードアーキテクチャを採用します。
本バージョンより、プロジェクトごとの独立したGitリポジトリ管理とマルチプロジェクト対応のアーキテクチャに刷新されています。

## 2. 全体方針

### 2.1 アーキテクチャ

`coding.md` の規定に従い、以下のディレクトリ構成と責務分担とします。

```
frontend/src/
├── domain/                  # [ドメイン層] ビジネスロジックと型定義
│   ├── entities/            # 【Entity】Task, Settings, ProjectSettingsなど
│   ├── repositories/        # 【Repository Interface】ITaskRepository, ISettingsRepository, IProjectRepository
│   └── services/            # 【Domain Service】GanttChartServiceなど
│
├── infrastructure/          # [インフラ層] 外部通信の実装
│   ├── api/                 # APIクライアント
│   │   ├── client.ts        # fetchラッパー
│   │   └── repositories/    # Repositoryの実装 (TaskApiRepository, SettingsApiRepository, ProjectApiRepository)
│   └── dtos/                # APIレスポンス等の型定義 (Domain Entityへの変換前)
│
├── application/             # [アプリケーション層] ユースケース (Custom Hooks)
│   ├── providers/           # DependencyProvider (DIコンテナ)
│   └── usecases/            # useTaskUseCase, useSettingsUseCase, useProjectUseCase
│
├── presentation/            # [プレゼンテーション層] UIコンポーネント
│   ├── components/          # 共通UI部品 (Button, Input, Modal, etc.)
│   ├── styles/              # グローバルスタイル (index.css)
│   └── pages/               # ページコンポーネント (Page/View)
│       ├── GlobalSettingsPage/ # 全体設定画面
│       ├── ProjectManagementPage/ # プロジェクト管理画面
│       ├── ProjectCreatePage/     # プロジェクト新規作成画面
│       ├── SettingsPage/          # プロジェクト固有設定画面
│       ├── TaskListPage/          # タスク一覧画面
│       └── GanttChartPage/        # ガントチャート画面
│
└── main.tsx                 # エントリーポイント
```

### 2.2 技術スタック

- **言語**: TypeScript
- **フレームワーク**: React (Vite)
- **UIライブラリ**: Mantine (テーマベースのUI構築)
- **スタイリング**: TailwindCSS (Utility First CSS)
- **状態管理**: React Context + Custom Hooks (局所的な状態はuseState)
- **ルーティング**: React Router (react-router-dom) を用いたURLベースのコンテキスト管理
- **その他ライブラリ**: ドラッグ＆ドロップによる順序変更のため `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` を使用

## 3. コンポーネント設計

### 3.1 共通レイアウト (`presentation/components/Layout`)

2種類のコンテキスト（Global / Project）に応じたレイアウトを提供します。

- `App.tsx`: アプリのルート。`BrowserRouter` の配下でコンテキストに応じた `GlobalLayout` と `ProjectLayout` をルーティング。
- `MenuBar`: ヘッダ部分。Contextパラメーターを受け取り表示を切り替える。
  - **Global Context**: ロゴ、プロジェクト管理リンク、全体設定リンク。
  - **Project Context**: ロゴ、プロジェクト管理へ戻るリンク、タスク・ガントチャート・プロジェクト設定リンク、プロジェクト切り替えプルダウン、Undo/Redoボタン。

### 3.2 ページコンポーネント (`presentation/pages`)

#### 3.2.1 グローバルコンテキスト

- `ProjectManagementPage`: 既存プロジェクトの一覧表示と新規プロジェクト作成画面へのナビゲーションを提供。`useProjectUseCase`を利用。
- `GlobalSettingsPage`: 全体で使用される基本設定（BasicSettings: 1日の標準労働時間、タスクステータス・タイプ、休日定義）を表示。`useSettingsUseCase`を利用。
- `ProjectCreatePage`: 新規プロジェクトを作成するための画面。プロジェクト名を入力して作成ボタンを押下。作成完了後、該当プロジェクト画面へ自動遷移。

#### 3.2.2 プロジェクトコンテキスト (`/projects/:projectName/*`)

URLパスパラメーター `projectName` を取得し、各ユースケースへ渡してデータ取得と更新を行います。

- `TaskListPage`: タスク一覧。`useTaskUseCase`を使用。
  - 新規作成、インライン編集、ドラッグ＆ドロップによる順序変更機能を包含。
  - `TaskDetailModal`: タスクの詳細編集モーダル。
- `GanttChartPage`: ガントチャート表示。
  - 依存する `GanttChartService` を用いて、親子関係や進捗を示すイナズマ線の計算と描画を実行。
  - ズームIn/Out制御、ドラッグ＆ドロップのタスク入れ替え対応。
- `SettingsPage`: プロジェクト単位の設定画面。
  - `ProjectSettingsForm`: プロジェクト特有設定（名称の変更や設定のオーバーライド）を編集。
  - 全体設定（Global Settings）も参照用ボードとして表示。

## 4. データ・状態管理

### 4.1 アプリケーション状態 (Application State)

Redux等のグローバルストアは使用せず、依存注入(DI)コンテナ `DependencyProvider` を通じてRepository層を注入された `Custom Hooks` (`useTaskUseCase`, `useProjectUseCase` 等) が状態 (`data`, `isLoading`, `error`) を管理します。ページルートコンポーネントがこれを購読し、子コンポーネントへPropsとして渡す設計（Prop Drillingの最小化）です。

### 4.2 API連携 (Infrastructure)

- **Repository Pattern**: `infrastructure/api/repositories` 内の `ProjectApiRepository`, `TaskApiRepository`, `SettingsApiRepository` 等が `ApiClient`クラスを用いてバックエンドAPIをコール。
- 全てのプロジェクト内データを操作するAPIは、URLパスとして `projectName` を必要とします。(例: `GET /api/v1/projects/:projectName/tasks`)
- 変換: APIからのJSONレスポンスはInfrastructure層・UseCase層を経てDomain Entityへ変換・適用されます。

### 4.3 初期化とルーティング定義

React Routerによるルーティング定義:

1. `/*`: `GlobalLayout`
   - `/projects` -> `ProjectManagementPage`
   - `/projects/new` -> `ProjectCreatePage`
   - `/settings` -> `GlobalSettingsPage`
   - `/` -> `/projects` へのリダイレクト
2. `/projects/:projectName/*`: `ProjectLayout`
   - `/` -> `TaskListPage`
   - `/gantts` -> `GanttChartPage`
   - `/settings` -> `SettingsPage`

## 5. エラーハンドリング

- API呼び出しにおけるエラーは `usecases` でキャッチし、ステート (`error: Error | null`) として保持され、コンポーネントへ渡ります。
- UI上では、エラーメッセージ表示エリアを通してユーザーにフィードバックを提供します。
- 操作エラー時（例: プロジェクト作成失敗時）は各フォーム内の即時エラー表示で対応します。
