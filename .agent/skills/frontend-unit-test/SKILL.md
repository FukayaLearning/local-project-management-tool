---
name: frontend-unit-test
description: フロントエンドの単体試験を実行し、デバッグを支援します。
---

# フロントエンド単体試験 (frontend-unit-test)

このスキルは、フロントエンドの単体試験（Vitest）を実行し、実行ログおよびカバレッジレポートを生成するために使用されます。

## 実行方法

```bash
bash doc/test/unit/run_frontend_unit_test.sh
```

## 注意事項

- 実行には Docker が必要です。
- スクリプトはプロジェクトルートから実行することを想定しています。
- 試験結果とログは `doc/test/unit/result/frontend/` にresult_YYYYMMDD_HHMMSS.logのファイル名で保存されます。
- カバレッジレポートは `doc/test/unit/result/frontend/coverage/index.html` で確認できます。
