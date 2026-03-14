---
name: demo
description: 結合試験実行スクリプトをデモモードで実行し、ブラウザ上で動作を確認できるようにします。
---

# デモ実行 (demo)

このスキルは、プロジェクトの結合試験をデモモードで実行するために使用されます。デモモードでは、ヘッドレスではなく実際のブラウザが起動し、実行の様子を視覚的に確認できます。

## 実行方法

1. **すべてのテストをデモモードで実行する:**

   ```bash
   bash .agent/skills/demo/scripts/execute_demo.sh
   ```

2. **特定のテストファイルをデモモードで実行する:**
   ```bash
   bash .agent/skills/demo/scripts/execute_demo.sh --run doc/test/integration/scripts/03_TaskManagement.spec.ts
   ```

## 注意事項

- 実行には Docker が必要です。
- ホスト環境に Node.js および Playwright の依存関係がインストールされます。
- 実行後、ブラウザが起動したままになる場合がありますが、スクリプトの終了時にクリーンアップが行われます。
