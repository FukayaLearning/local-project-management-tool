---
name: run
description: プロジェクトを起動します。
---

# 起動 (run)

このスキルは、プロジェクトを起動するために使用されます。プロジェクトルートにある `run.sh` を呼び出します。

## 実行方法

```bash
bash run.sh
```

- 自動起動設定を有効にする場合（Dockerの 'restart: always' ポリシー適用）:
  ```bash
  bash run.sh --autostart
  ```

## 注意事項

- 実行には Docker が必要です。
- スクリプトはプロジェクトルートから実行することを想定しています。
- 実行後、アプリケーションは http://localhost:8080 で利用可能になります。
