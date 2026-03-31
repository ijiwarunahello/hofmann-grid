# Hofmann Grid

Armin Hofmann's *Graphic Design Manual* (1965), Variations 51--53 をベースにしたインタラクティブなグリッドジェネレーター。円のグリッド上で接線を選択し、閉じた輪郭を構築する。

bbtgnn/hofmann-1.0.0 (TypeScript + Paper.js) を参考に、依存ライブラリなしの SVG ベースで再実装。


## Getting Started

```
npm install
npm run dev
```


## systemd Deployment

`vite dev` ではなく、ビルド済みの `dist/` を `vite preview` で配信する前提。

1. ビルドと待受を確認

```bash
npm run build
npm run preview:host
```

2. ユニットを配置

```bash
mkdir -p ~/.config/systemd/user
cp deploy/systemd/hofmann-grid-preview.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now hofmann-grid-preview
```

3. 状態確認

```bash
systemctl --user status hofmann-grid-preview
journalctl --user -u hofmann-grid-preview -f
```

4. 更新反映

```bash
git pull
systemctl --user restart hofmann-grid-preview
```

公開先は `http://<host-ip>:5173/` 。

ログインしていない状態でも自動起動させたい場合は、別途 root 権限で `loginctl enable-linger iri` が必要。


## Usage

1. 円をクリックして **active** ノード (始点) に設定
2. 別の円をクリックして **target** ノードに設定
3. 2円間に最大4本の接線がプレビュー表示される
4. 接線をクリックして輪郭に追加 -- target が次の active になる
5. 始点の円に戻ると輪郭が閉じ、塗りつぶし表示になる

| Key | Action |
|---|---|
| `Esc` | 選択解除 |
| `?` | ヘルプ表示 |

**RANDOM** -- ランダムな閉じた輪郭を自動生成する。


## Controls

| Control | Description |
|---|---|
| ROWS / COLS | グリッドサイズ変更 (2--10) |
| RADIUS | 円の半径比率。閉じた輪郭を保ったまま変更可能 |
| CLEAR | 全輪郭をクリア |
| SVG / PNG | 塗りつぶし領域のみをエクスポート |


## Architecture

```
src/
  main.ts                 Entry point
  style.css               Swiss Style design tokens
  math/
    geometry.ts            Point ops, polar, angle utilities
    tangent-calc.ts        4 tangent formulas, coordinate transform
  model/
    types.ts               Shared type definitions
    nodo.ts                Grid node (i, j, state)
    tangent.ts             Tangent between two nodes
    contour.ts             Ordered tangent segments, closed flag
    app-state.ts           Central state, grid ops, random generation
  render/
    svg-renderer.ts        SVG element, layered groups, resize
    nodo-renderer.ts       Circle rendering + mouse events
    tangent-renderer.ts    Tangent preview with hit areas
    contour-renderer.ts    Contour path (lines + arcs), runtime recompute
  ui/
    interaction.ts         Click/hover state machine
    controls.ts            Row/col buttons, radius slider, help overlay
  export/
    svg-export.ts          SVG serialize + download
    png-export.ts          SVG to Canvas to PNG (2x)
```


## Tangent Geometry

2円の中点を原点、中心間ベクトルを x 軸に揃えた正規座標系で計算する。

**External (Straight)**
- OO: `pA = (-d, -r)`, `pB = (d, -r)`
- AA: `pA = (-d,  r)`, `pB = (d,  r)`

**Internal (Diagonal)** -- `d > r` の場合のみ
- `m = sqrt(r^2 / (d^2 - r^2))`
- `x = d / (1 + m^2)`, `y = m * x`
- OA: `pA = (-x, -y)`, `pB = (x, y)`
- AO: `pA = (-x,  y)`, `pB = (x, -y)`

正規座標を回転 + 平行移動でワールド座標に変換する。


## Tech Stack

- TypeScript + Vite
- SVG (DOM direct manipulation)
- No runtime dependencies


## License

MIT
