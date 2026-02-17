---
trigger: always_on
---

# コーディングルール

## 実装共通

- DDDで実装する。
- 変数・関数などの各シンボルを省略せず目的がわかる名称にする。
- コメントを書かなくても処理目的がわかるように関数分割し、関数名で示す。
- Presentation層、Application層、Domain層、Infrastructure層にわける。
- Presentation層は画面・APIのユーザインターフェース部分となり、入力を受けたらDomain層のエンティティに変換してApplication層を呼び出す。Application層の戻り値を変換して出力する。
- Application層はDomain層を参照する。
- Infrastructure層はDomain層を参照する。
- Dependency Injectionとして、Infrastructure層をメインプログラムやPresentation層などの最上位で依存関係を注入する。
- Application層がInfrastructure層に依存しないように、Infrastructure層はDomain層のRepositoryインターフェースを実装して、Application層からDependency InjectionされたInfrastructure層を、Domain層のRepositoryインターフェースを使用して実行する。

## フロントエンド実装フォルダ構成

frontend/
├── domain/ # [ドメイン層] ビジネスロジックの中核（外部依存なし）
│ ├── entities/ # 【Entity】Userクラスなど（振る舞いを持つ）
│ ├── valueObjects/ # 【Value Object】Email, UserId など
│ ├── repositories/ # 【Repository Interface】（抽象基底クラス）
│ ├── helpers/ # 標準ライブラリレベルの汎用スタティック関数
│ └── services/ # 【Domain Service】モデル単体で完結しないロジック
│
├── infrastructure/ # [インフラ層] 技術的な詳細実装（DB, 外部APIなど）
│ └── 「DB種類などの技術名」/ # domainのRepository Interfaceを継承・実装
│ └── schemas/ # 技術に依存した入出力用モデル
│
├── application/ # [ViewModel] Viewのための状態管理・ロジック (Custom Hooks)
│ ├── usecases/ # ユースケース単位のフック
│ │
│ └── store/ # グローバルstateが必要な場合 (Zustand/Recoilなど)
│
├── presentation/ # [View] UIコンポーネント・ページ
│ ├── viewModels/ # 【ViewModel】フォーム状態、バリデーション、Repo呼び出しを管理
│ │
│ ├── styles/ # グローバルスタイル
│ │
│ └── pages/ # ページコンポーネント (Routerの宛先)
│ ├── common/
│ │ └── components/ # 共通UI部品 (Button, Inputなど)
│ └── <ページ名>/
│ └── components/ # ページ固有の分解されたコンポーネント
└── tests/ # ドメイン層、アプリケーション層の単体テスト

```

## バックエンド実装ディレクトリ構成

```

backend/
├── domain/ # [ドメイン層] ビジネスロジックの中核（外部依存なし）
│ ├── entities/ # 【Entity】Userクラスなど（振る舞いを持つ）
│ ├── valueObjects/ # 【Value Object】Email, UserId など
│ ├── repositories/ # 【Repository Interface】（抽象基底クラス）
│ ├── helpers/ # 標準ライブラリレベルの汎用スタティック関数
│ └── services/ # 【Domain Service】モデル単体で完結しないロジック
│
├── application/ # [アプリケーション層] ユースケース（ドメイン層を使って処理をまとめる）
│ └── usecases/ # 【UseCase】
│
├── infrastructure/ # [インフラ層] 技術的な詳細実装（DB, 外部APIなど）
│ └── 「DB種類などの技術名」/ # domainのRepository Interfaceを継承・実装
│ └── schemas/ # 技術に依存した入出力用モデル
│
├── presentation/ # [プレゼンテーション層] APIエンドポイント (FastAPI/Flask/Django)
│ └── api/
│ └── v1/
│ ├── endpoints/ # ルータ定義
│ └── schemas/ # 【DTO】Pydanticモデル（リクエスト/レスポンス用スキーマ）
│
└── tests/ # ドメイン層、アプリケーション層の単体テスト

```

```
