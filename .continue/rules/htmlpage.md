---
trigger: always_on
---

# ドキュメント作成ガイドライン

## 1. 画面イメージ（UIプレビュー）の埋め込みについて

操作マニュアルや設計書等において、UIの画面イメージを表示する際は、画像ファイル（スクリーンショット）ではなく、**HTMLコードを直接Markdownファイル内に埋め込む**方式を推奨します。これにより、デザイン変更時の修正が容易になり、Gitでの差分管理もしやすくなります。

### 1.1 基本ルール

- **HTMLフラグメントとして記述**:
  - `<html>`、`<head>`、`<body>` タグは使用しません。
  - 表示したいUIコンポーネントを、一つの親 `<div>` タグで囲んで記述します。
- **Markdownファイルへの直接記述**:
  - 外部HTMLファイルを `iframe` で読み込むのではなく、Markdownファイル内に直接コードを記述します。これにより、プレビューアでの表示互換性が高まります。

### 1.2 スタイル定義

- **`<style>` タグの使用**:
  - 各HTMLブロック内に `<style>` タグを含め、そのブロック専用のCSSを定義します。
- **クラス名の競合回避**:
  - 作成するスタイルが他の箇所のスタイルやMarkdownプレビューアのデフォルトスタイルと競合しないよう、クラス名にはプレフィックスをつけるか、ユニークな名前（例: `.settings-page`, `.task-modal`）を使用してください。
- **レイアウトの単純化**:
  - Markdownプレビューア（特にVS CodeのMarkdown Preview Enhanced等）での表示崩れを防ぐため、Flexboxなどの複雑なレイアウトの使用は慎重に行い、可能な限りシンプルなCSS（例: `margin: 0 auto;` による中央寄せ等）でレイアウトを組むことを推奨します。

### 1.3 記述例

```html
<div
  style="background-color: #f4f4f9; padding: 20px; font-family: 'Segoe UI', sans-serif; color: #333;"
>
  <style>
    /* プレフィックス付きのクラス名を使用 */
    .my-screen-container {
      max-width: 800px;
      margin: 0 auto; /* 中央寄せ */
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .my-screen-title {
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-top: 0;
    }
  </style>

  <div class="my-screen-container">
    <h1 class="my-screen-title">設定画面</h1>
    <p>ここに画面要素を配置します。</p>
    <button style="padding: 8px 16px; cursor: pointer;">保存</button>
  </div>
</div>
```

### 1.4 注意点

- **高さの指定**: 固定の `height` を親コンテナに指定すると、内容が溢れたり意図しない余白ができたりする場合があるため、内容に応じた高さになるようにしてください。
- **フォント**: OSに依存しない汎用的なフォントファミリ（例: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`）を指定すると、異なる環境でも見た目が統一されやすくなります。
