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
  - 可視化: ガントチャート、イナズマ線。

## 技術スタック

- **フロントエンド**: React, TypeScript, Vite, Vanilla CSS (DDDレイヤードアーキテクチャ)
- **バックエンド**: Python 3.12+, FastAPI, Pandas (DDDレイヤードアーキテクチャ)
- **インフラ**: Docker (Frontend, Backend, Nginx)
- **データベース**: なし（`data/` ディレクトリ内のJSON/CSVファイル）
- **バージョン管理**: Git（ソースコードおよびタスクデータの永続化用）

## プロジェクトルールとアーキテクチャ

`.gemini/antigravity/memory/` 内のルールおよび `SKILL.md`（使用する場合）を厳守してください：

- **コーディング (coding.md)**:
  - DDDレイヤードアーキテクチャ: Presentation, Application, Domain, Infrastructure。
  - PresentationはDomainエンティティに変換し、Application/InfrastructureはDomainに依存。
  - 最上位での依存性注入 (DI) が必須。
- **ドキュメント (documents.md)**:
  - 常に英語 (`.md`) と日本語 (`.ja.md`) のペアを維持。
  - `doc/` 配下の特定のファイルツリー構成（要求、システム設計、トレーサビリティマトリックス等）。
- **開発プロセス (processes.md)**:
  - 要求定義からREADME更新まで、定められた21段階のフローを遵守。
- **テスト (test.md)**:
  - すべての手順にはスクリプト（`build.sh`, `run.sh`, `stop.sh`）を使用。
  - 単体試験: 分岐網羅80%以上、インフラはMock化。
  - 結合試験: PlaywrightによるシナリオベースのE2E。
  - エビデンス（ログ/標準出力）は `result/` ディレクトリに保存。
- **UIデザイン (htmlpage.md)**:
  - Markdown内の画面イメージはHTMLフラグメントとして埋め込む。

## 利用可能なスキル (Skills)

以下のスキルを使用して複雑なタスクを実行できます：

- `backend-unit-test`: バックエンドの単体試験を実行し、デバッグを支援。
- `demo`: 結合試験スクリプトをデモモード（ブラウザ表示あり）で実行。
- `frontend-unit-test`: フロントエンドの単体試験を実行し、デバッグを支援。
- `integration-test`: フルスタックの結合試験およびシナリオを実行。
- `run`: 適切な環境でプロジェクトを起動。
- `stop`: 起動中のプロジェクトコンテナを停止。

## ワークフロー (スラッシュコマンド)

- `/check-traceability`: 要求、設計、実装、試験の整合性をチェック。
- `/debug`: バグや試験失敗の根本原因を特定。
- `/do-remain-process`: プロセスフローに従い、現在のフェーズから開発を継続。
- `/reverse-engineering`: ソースコードや試験コードからドキュメントを掘り起こす。
- `/review`: ルールへの準拠をドキュメントとコードの両面でレビュー。
- `/sync-documents`: 英語版と日本語版のドキュメントを同期。

## 現在のステータス (2026-03-19 時点)

- [x] 基本設定とプロジェクト管理
- [x] タスクのCRUD (CSV保存)
- [x] Git連携コア機能 (自動コミット、ブランチ切り替え)
- [x] Undo/Redo 機能
- [x] 初期化フロー (システムステータス確認)
- [x] ガントチャート機能
- [ ] イナズマ線ロジック (計画中)

## 重要なファイル

- `backend/app/main.py`: エントリーポイントおよびDI設定。
- `frontend/src/main.tsx`: フロントエンドエントリーポイント。
- `doc/design/requirement.ja.md`: 機能要求の真実のソース。
- `doc/design/traceability_matrix.md`: 実装状況の追跡（トレーサビリティマトリックス）。

## 共通ワークフロー

- `doc/test/integration/scripts/` 配下でE2Eシナリオを実行または定義。
- 各 `result/` ディレクトリで試験のエビデンスとログを管理。

## 開発手順

ビルド、試験、デモのすべての手順は、整合性を保つためにプロジェクト規定のスクリプトを使用してください。

- **ビルド**: `./build.sh`
- **本番環境起動**: `./run.sh`（または `./run.sh --autostart`）
- **本番環境停止**: `./stop.sh`
- **バックエンド単体試験**: `./doc/test/unit/run_backend_unit_test.sh`
- **フロントエンド単体試験**: `./doc/test/unit/run_frontend_unit_test.sh`
- **結合試験**: `./doc/test/integration/run_integration_test.sh`
- **デモモード**: `./doc/test/integration/run_integration_test.sh --demo`

## 試験結果（エビデンス）とデバッグ

ログは `doc/test/*/result/` に保存されます。

1. `result_TIMESTAMP.log` を確認し、失敗したアサーションを特定する。
2. `backend.log` または `frontend.log` を確認し、コンテナやAPIのエラーを調査。
3. UIの失敗は `test-results/` 内のスクリーンショットやトレース情報を確認。
