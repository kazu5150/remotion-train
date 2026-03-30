# Remotion ナレーション動画プロジェクト

React + TypeScript + [Remotion](https://www.remotion.dev/) で、ナレーション・BGM付きの解説動画をプログラマティックに生成するプロジェクトです。

音声生成に [ElevenLabs](https://elevenlabs.io/) API（Text-to-Speech / Music Generation）を使用し、動画のシーン切り替えがナレーションの長さに自動同期します。

## 収録コンポジション

| ID | テーマ | 種別 |
|---|---|---|
| `DoorIntoSummer` | ハインライン「夏への扉」SF小説紹介 | ナレーション + BGM |
| `OpenClaw` | OpenClaw開発者、米中AI導入格差に警鐘 | ナレーション + BGM |
| `OpenAICoup` | OpenAI CEO解任劇 2023年11月 | ナレーション + BGM |
| `DarioVsSam` | Dario Amodei vs Sam Altman | ナレーション + BGM |
| `IlyaSutskever` | イリア・サツケバー人物紹介 | ナレーション + BGM |
| `AmandaAskellNarrated` | Amanda Askell人物紹介（縦動画） | ナレーション + BGM |
| `AmandaAskell` | Amanda Askell人物紹介（横動画） | アニメーションのみ |
| `AmandaAskellTikTok` | Amanda Askell人物紹介（TikTok縦） | アニメーションのみ |

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.env` ファイルをプロジェクトルートに作成：

```
ELEVENLABS_API_KEY=sk-xxxxxxxxxxxxx
ELEVENLABS_VOICE_ID=xxxxxxxxxxxxx
```

- `ELEVENLABS_API_KEY`: ElevenLabs の API キー
- `ELEVENLABS_VOICE_ID`: 使用するボイスの ID

**APIキーの必須権限**: Text to Speech, Music Generation, User Read

## 使い方

### プレビュー

```bash
npm run dev
```

ブラウザで http://localhost:3000 が開き、サイドバーからコンポジションを選択してプレビューできます。

### ナレーション・BGM生成

各動画には対応する生成スクリプトがあります：

```bash
npx tsx generate-door-into-summer.ts   # 夏への扉
npx tsx generate-openclaw.ts           # OpenClaw
npx tsx generate-openai-coup.ts        # OpenAI解任劇
npx tsx generate-dario-sam.ts          # Dario vs Sam
npx tsx generate-ilya-sutskever.ts     # イリア・サツケバー
npx tsx generate-voiceover.ts          # Amanda Askell
npx tsx generate-bgm.ts               # Amanda Askell BGM
```

生成スクリプトは実行時に ElevenLabs のクレジット使用量をレポートします：

```
╔══════════════════════════════════════════╗
║      ElevenLabs Credit Report            ║
╠══════════════════════════════════════════╣
║  プラン:       starter                  ║
║  今回の使用:   4400                     ║
║  累計使用:     23102 / 90000            ║
║  残りクレジット: 66898 (74.3%)          ║
╚══════════════════════════════════════════╝
```

既に生成済みの音声ファイルはスキップされます。再生成したい場合は該当ファイルを削除してから再実行してください。

### MP4レンダリング

```bash
npx remotion render <CompositionId> output/<name>.mp4
```

例：
```bash
npx remotion render DoorIntoSummer output/door-into-summer.mp4
npx remotion render OpenClaw output/openclaw.mp4
```

## プロジェクト構成

```
remotion/
├── src/
│   ├── Root.tsx                      # 全コンポジションの登録
│   ├── DoorIntoSummerVideo.tsx       # 夏への扉
│   ├── OpenClawVideo.tsx             # OpenClaw
│   ├── OpenAICoupVideo.tsx           # OpenAI解任劇
│   ├── DarioVsSamVideo.tsx           # Dario vs Sam
│   ├── IlyaSutskeverVideo.tsx        # イリア・サツケバー
│   ├── AmandaAskellTikTokNarrated.tsx # Amanda（ナレーション付き）
│   ├── AmandaAskellVideo.tsx         # Amanda（横動画）
│   ├── AmandaAskellTikTok.tsx        # Amanda（TikTok）
│   └── get-audio-duration.ts         # 音声長取得ユーティリティ
├── public/
│   ├── images/                       # 動画で使用する画像素材
│   └── voiceover/                    # ナレーション音声・BGM
│       ├── door-into-summer/
│       ├── openclaw/
│       ├── openai-coup/
│       ├── dario-sam/
│       ├── ilya-sutskever/
│       └── amanda-askel/
├── generate-*.ts                     # ElevenLabs音声生成スクリプト
├── output/                           # レンダリング済みMP4（.gitignore）
└── .env                              # APIキー（.gitignore）
```

## 技術スタック

| 技術 | 用途 |
|---|---|
| [Remotion](https://www.remotion.dev/) | React ベースの動画生成フレームワーク |
| [ElevenLabs](https://elevenlabs.io/) | Text-to-Speech（ナレーション）+ Music Generation（BGM） |
| React + TypeScript | コンポジション（動画コンポーネント）の実装 |
| Zod | Props のスキーマ定義・バリデーション |

## 動画生成の仕組み

### 音声同期

各動画は `calculateMetadata` を使って、ナレーション音声の長さからシーンのフレーム数を動的に計算します。これにより、ナレーションの内容を変更しても動画の長さが自動的に調整されます。

```
ナレーション音声の長さ → シーンのフレーム数を自動計算 → 動画全体の長さが決定
```

### クレジット追跡

生成スクリプトは ElevenLabs API の `/v1/user/subscription` エンドポイントを使い、生成前後のクレジット残量を比較してレポートを表示します。Music API のクレジット反映には遅延があるため、BGM 生成後にポーリングして正確な値を取得します。

## Claude Code スキル

このプロジェクトは [Claude Code](https://claude.ai/claude-code) のスキル機能を活用して開発されています。

### `remotion-narrated-video` スキル

「〜の動画を作って」と指示するだけで、以下を一気通貫で自動実行するスキルです：

1. **リサーチ** — Web検索で対象の情報を収集
2. **画像取得** — 公開画像があれば `public/images/` にダウンロード
3. **コンポジション作成** — シーン構成を設計し、Reactコンポーネントを生成
4. **ナレーション生成** — ElevenLabs TTS APIで各シーンの音声を生成
5. **BGM生成** — ElevenLabs Music APIでBGMを生成
6. **クレジット追跡** — 使用したElevenLabsクレジットをレポート表示
7. **Root.tsx登録** — `calculateMetadata` で音声長に自動同期
8. **MP4レンダリング** — `output/` に出力

テーマはAI/IT に限らず、SF小説、歴史、人物伝記など、どんなジャンルでも対応します。

### `remotion-best-practices` スキル

Remotion でのアニメーション実装のベストプラクティスを提供するスキルです。`interpolate` や `spring` の使い方、パフォーマンス最適化などのガイドラインが含まれています。

## ライセンス

Remotion のライセンスについては [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) を参照してください。
