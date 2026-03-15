---
name: backend-unit-test
description: バックエンドの単体試験を実行し、デバッグを支援します。
---

# バックエンド単体試験 (backend-unit-test)

このスキルは、バックエンドの単体試験（Pytest）を実行し、実行ログおよびカバレッジレポートを生成するために使用されます。

## 実行方法

```bash
bash doc/test/unit/run_backend_unit_test.sh
```

## 注意事項

- 実行には Docker が必要です。
- スクリプトはプロジェクトルートから実行することを想定しています。
- 試験結果とログは `doc/test/unit/result/backend/` に保存されます。
- カバレッジレポートは `doc/test/unit/result/backend/coverage/index.html` で確認できます。
