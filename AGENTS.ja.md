# AGENTS.ja.md (引き継ぎドキュメント)

このドキュメントは、本プロジェクトに従事するAIエージェントがコンテキストを迅速に把握し、効率的に作業を開始するための情報を集約したものです。

## 概要

- **名称**: Local Project Management Tool
- **コンセプト**: オフライン、ファイルベース（JSON/CSV）のデータ管理と、Gitを用いた履歴管理を組み合わせたプロジェクト管理ツール。
- **主要機能**:
  - 設定管理 (JSON)
  - タスク管理 (CSV, UUID v4)
  - Git連携: 変更時の自動コミット、起動時・実行時の手動変更検知同期。
  - 履歴管理: Git restoreを利用した Undo/Redo。
  - 可視化: ガントチャート、イナズマ線（計画中）。

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite, TailwindCSS (DDDレイヤードアーキテクチャ)
- **バックエンド**: Python 3.12+, FastAPI, Pandas (DDDレイヤードアーキテクチャ)
- **インフラ**: Docker (Frontend, Backend, Nginx)
- **データベース**: なし（`data/` ディレクトリ内のJSON/CSVファイル）
- **バージョン管理**: Git（ソースコードおよびタスクデータの永続化用）

## 設計・ルール

`.gemini/antigravity/memory/` 内のルールを厳守してください：

- `coding.md`: DDDのレイヤー分け（Presentation, Application, Domain, Infrastructure）。
- `documents.md`: ドキュメント構造および日英併記の原則。
- `processes.md`: 開発プロセスの順序（要求->設計->実装->テスト）。
- `test.md`: 試験ルール（Vitest for FE, Pytest for BE）。実行にはスクリプトを使用。
- `htmlpage.md`: Markdown内の画面イメージはHTMLフラグメントとして埋め込む。

## 現在のステータス (2026-02-21 時点)

- [x] 基本設定とプロジェクト管理
- [x] タスクのCRUD (CSV保存)
- [x] Git連携コア機能 (自動コミット、ブランチ切り替え)
- [x] Undo/Redo 機能
- [/] 初期化フロー (システムステータス確認)
- [ ] ガントチャートロジック (計画中)
- [ ] イナズマ線ロジック (計画中)

## 重要なファイル

- `backend/app/main.py`: エントリーポイントおよびDI設定。
- `frontend/src/main.tsx`: フロントエンドエントリーポイント。
- `doc/design/requirement.ja.md`: 機能要求の真実のソース。
- `doc/design/traceability_matrix.md`: 実装状況の追跡。

## 共通ワークフロー

- `/check-traceability`: ドキュメントの整合性チェック。
- `/do-remain-process`: 開発プロセスの途中から再開する場合に使用。
- `doc/test/integration/scripts/`: 結合試験シナリオの実行。

## 開発手順

ビルド、試験、デモのすべての手順は、整合性を保つためにプロジェクト規定のスクリプトを使用して実行してください。

### ビルド確認 (本番環境同等)

プロジェクト直下のスクリプトを使用し、本番環境と同じ構成でビルドができることを確認します。

- **実行**: `./build.sh`

### 本番環境実行

プロジェクト直下のスクリプトを使用し、本番環境と同じ構成でアプリケーションを起動します。

- **実行**: `./run.sh`
- **オートスタート設定**: `./run.sh --autostart` を実行すると、Docker の `restart: always` ポリシーが設定され、PC起動時やDockerデスクトップ起動時に自動開始されます。
- **アクセス**: `http://localhost:8080` (Nginx経由)

### 本番環境停止

プロジェクト直下のスクリプトを使用して、本番環境を停止します。

- **実行**: `./stop.sh`

### 単体試験

以下のスクリプトは、単体試験環境のビルド確認と試験を同時に実行します。

- **バックエンド単体試験**: `./doc/test/unit/run_backend_unit_test.sh`
- **フロントエンド単体試験**: `./doc/test/unit/run_frontend_unit_test.sh`

### 結合試験

全スタックを本番モードで起動し、E2Eシナリオを実行します。

- **実行**: `./doc/test/integration/run_integration_test.sh`

### アプリケーションデモ (デモ/デバッグモード)

アプリケーションを開発モードで起動し、データを初期化した上で結合試験（デモ用）を実行します。

- **実行**: `./doc/test/integration/run_integration_test.sh --demo`

### 試験結果（エビデンス）とデバッグ

実行ログと結果は、`doc/test/` 配下のそれぞれの `result/` ディレクトリに保存されます。不具合発生時の調査に活用してください。

- **結合試験 (`doc/test/integration/result/`)**:
  - `result_TIMESTAMP.log`: Playwrightのテスト実行ログ。
  - `backend.log`: バックエンドコンテナのログ（APIエラーの調査に有効）。
  - `frontend.log`: フロントエンドコンテナのログ。
  - `test-results/`: 失敗したテストのスクリーンショットやトレース情報。
- **単体試験 (`doc/test/unit/result/`)**:
  - `backend/result_TIMESTAMP.log`: Pytestの実行ログとトレース。
  - `frontend/result_TIMESTAMP.log`: Vitestの実行ログ。
  - `*/coverage/index.html`: コードカバレッジレポート（ブラウザで確認可能）。

**デバッグの進め方**:

1. `result_TIMESTAMP.log` を確認し、失敗したアサーションを特定する。
2. `backend.log` を確認し、バックエンド側で例外やエラーレスポンス(500/400系)が発生していないか調査する。
3. 画面崩れや操作の失敗は `test-results/` 内のスクリーンショットを確認する。
