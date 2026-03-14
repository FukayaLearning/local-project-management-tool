#!/bin/bash
# デモ実行スキルのラッパースクリプト

# プロジェクトルートを取得
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../.." && pwd)"

# 結合試験実行スクリプトをデモモードで起動
# 全ての引数をそのまま引き継ぐ（例: --run scripts/xxx.spec.ts）
bash "${REPO_ROOT}/doc/test/integration/run_integration_test.sh" --demo "$@"
