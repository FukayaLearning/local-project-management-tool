---
name: integration-test
description: 結合試験を実行し、デバッグやデモを支援します。
---

# 結合試験 (integration-test)

このスキルは、プロジェクトの結合試験（Playwright）を実行するために使用されます。通常の試験実行に加え、デバッグ用のデモモードもサポートしています。

## 実行方法

1. **通常の結合試験を実行する (Headless):**

   ```bash
   bash doc/test/integration/run_integration_test.sh
   ```

2. **特定のテストファイルを指定して実行する:**

   ```bash
   bash doc/test/integration/run_integration_test.sh --run <path_to_spec_file>
   ```

## 注意事項

- 実行には Docker が必要です。
- 試験ログおよび証跡は `doc/test/integration/result/` に保存されます。
