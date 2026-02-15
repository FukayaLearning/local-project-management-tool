# Local Project Management Tool

オフライン環境で動作する、Python (FastAPI) + React 製のプロジェクト管理ツール。
データベース (RDBMS) は使用せず、設定は JSON、タスクデータは CSV で管理するファイルベース構成を採用しています。
Git をバックエンドの保存機構として利用し、強力な履歴管理 (Undo/Redo) を提供します。

## ✨ 特徴

*   **完全オフライン動作**: インターネット接続不要。ローカル環境だけで完結します。
*   **ファイルベース管理**: データは可読性の高い JSON と CSV で保存され、Git で管理されます。
*   **強力な履歴管理**: Git を利用した堅牢な Undo/Redo 機能により、安心してデータを編集できます。

## 📂 ディレクトリ構成 (予定)

```text
.
├── backend/            # Python (FastAPI) アプリケーション
│   ├── app/            # アプリケーションロジック
│   └── data/           # ユーザーデータ (JSON/CSV) - .gitignore 推奨
├── frontend/           # React アプリケーション
├── docs/               # 詳細ドキュメント
└── docker-compose.yml  # コンテナ実行用構成ファイル
```

## 🚀 実行方法 (開発環境)

### 前提条件

*   Python 3.12+
*   Node.js 20+
*   Git

### Docker (推奨)

Docker および Docker Compose を使用して、環境構築の手間なく実行できます。

1.  **コンテナの起動**
    ```bash
    docker compose up -d
    ```

2.  **アクセス**
    *   Frontend: [http://localhost:3000](http://localhost:3000)
    *   Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

3.  **停止**
    docker compose down
    ```

### ローカル実行 (手動)

Dockerを使用せず、個別にプロセスを起動する場合の手順です。

#### Backend

1.  **ディレクトリ移動**
    ```bash
    cd backend
    ```
2.  **仮想環境の作成と有効化**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/Mac
    # venv\Scripts\activate   # Windows
    ```
3.  **依存関係のインストール**
    ```bash
    pip install -r requirements.txt
    ```
4.  **サーバー起動**
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

#### Frontend

1.  **ディレクトリ移動**
    ```bash
    cd frontend
    ```
2.  **依存関係のインストール**
    ```bash
    npm install
    ```
3.  **開発サーバー起動**
    ```bash
    npm run dev
    ```
    ブラウザで [http://localhost:5173](http://localhost:5173) にアクセスします。

## 🧪 テスト

### フロントエンド単体テスト

```bash
docker compose exec frontend npm test
```

### フロントエンド結合テスト

Dockerコンテナ上で動作しているバックエンドと通信を行い、シナリオベースのテストを実行します。

```bash
docker compose exec frontend npm run test:integration
```

### バックエンド単体テスト

```bash
docker compose exec backend pytest
```


## 📐 データ構造仕様

### 基本設定 (JSON)

JSONファイルで以下の設定を管理します。

*   **タスク状態の定義**: ID, 名前（作業中, 完了の定義必須。例: New, Todo, Doing, Done, Postponed）
*   **タスク種類の定義**: ID, 名前（例: EPIC, Story, Task, Bug）
*   **担当者の定義**: ID, 名前, 生産性比率 (省略時1.0, 例: 1.0=標準, 1.2=高スキル), 投入比率 (省略時1.0, 例: 0.5=他PJと兼務で50%稼働)
*   **タスクデータ列の定義**: タスクデータのCSV保存時の列名定義
*   **1日投入時間(H)**: 標準の1日あたりの稼働時間（例: 8.5=8時間30分）
*   **休日の定義**:
    *   祝日CSV取得先URL（省略時は内閣府祝日CSV https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv ）
    *   休日曜日リスト（省略時は土日）
    *   例外出勤日, 追加休日

### プロジェクト設定 (JSON)

*   **プロジェクト情報**: プロジェクト名, プロジェクト開始日, プロジェクト終了予定日
*   **基本設定上書き**: 基本設定の値をプロジェクト単位で上書き可能。

### タスクデータ (CSV)

以下のタスクデータを管理します。インポート/エクスポートはCSVで行います。

*   **基本情報**: タスク種類, タイトル
*   **作業予定情報**: 見積工数(h), 担当者, スケジューリングルール（タスク優先順位 or 開始予定日指定 or 終了予定日指定）, タスク優先順位(数値), 開始予定日(日付), 終了予定日(日付)
*   **作業実績情報**: タスク状態（省略時はタスク状態の定義最上位）, 進捗(%), 実績時間(h), 実績開始日(日付), 実績終了日(日付)
*   **オプション情報**: 親タスク, 説明, コメント(任意数のリスト), 進捗履歴 (日付と進捗%のペアのリスト。イナズマ線描画に使用)

### 操作履歴データ (Git)

Gitをローカルリポジトリとして利用し、タスクデータの変更履歴を管理します。これにより Undo/Redo を実現します。

## 💡 機能要件

### 画面一覧

*   **設定画面**: 基本設定, プロジェクト設定
*   **タスク一覧画面**:
    *   タスク管理機能 (削除, 検索, 表示フィルタ, 並び替え)
    *   表示切替 (列表示/非表示, 親子階層ツリー表示, 作業タスクのみ表示, 親タスクのみ表示)
*   **タスク作成/編集モーダル**:
    *   タスクデータの登録・編集。自タスクIDは自動採番 (uuid4)。
    *   タスク一覧画面およびガントチャート画面から呼び出し可能。
*   **ガントチャート画面**:
    *   スケジューリングルールに従って各タスクの開始予定日と終了予定日を自動計算し表示。
    *   実績開始日・終了日、進捗に基づくイナズマ線 (過去含む) を表示。
    *   親子階層表示とサマリ機能 (親タスクは子タスクの期間を集計)。

### Undo/Redo

*   タスク作成・編集・並び替え時に、操作履歴データとして自動的に Git コミットを作成します。
*   Undo/Redo は `git restore` 等を用いて前後のコミット状態にタスクデータを復元することで実現します。

## 🛠 技術スタック

*   **Backend**: Python (FastAPI), Pandas (データ処理)
*   **Frontend**: React + TypeScript (Vite), Mantine (推奨 UI ライブラリ)
*   **Storage**: ローカルファイル (JSON/CSV)
*   **Version Control**: Git (subprocess / GitPython)