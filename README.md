# Quick Quotes

Discordのボイスチャンネルでの発言を非同期で文字起こしし、振り返ることができるBot

## 事前準備

1. Discord Botの作成
2. 環境変数の設定
   - `.env.sample` をコピーして `.env` を作成し、値を設定します
   - 最低限`DISCORD_BOT_TOKEN`さえ追記すれば起動します

## 使い方

### 起動

```sh
docker compose up -d
```

### スラッシュコマンド

| コマンド    | 説明                                        |
| ----------- | ------------------------------------------- |
| `/join`     | Botをボイスチャンネルに参加させ、録音を開始 |
| `/leave`    | Botをボイスチャンネルから退出させる         |
| `/lookback` | 直近の文字起こし結果を表示                  |
| `/ping`     | 疎通確認                                    |

### ログの確認

```sh
# 全サービス
docker compose logs -f

# 特定のサービス
docker compose logs -f transcriber
```

### 停止

```sh
docker compose down
```

## 注意事項

- **transcriber の初回起動が遅い**: 初回起動時にpip install (torch など約 2GB)とWhisperモデルのダウンロード(base: 約139MB)が実行されるため、数分かかります。2回目以降はキャッシュが利用されます
- **CPU 環境での動作**: GPUがない環境では `FP16 is not supported on CPU; using FP32 instead` の警告が出ますが、正常に動作します。ただし文字起こし処理に時間がかかります
- **Whisper モデルの選択**: `TRANSCRIBER_MODEL` でモデルサイズを変更できます。`tiny` は最速ですが精度が低く、`large` は高精度ですがダウンロードサイズとメモリ使用量が大きくなります
- **storage ディレクトリ**: botとtranscriber で共有されます。録音されたOGGファイルが蓄積されるため、ディスク容量に注意してください

## 構成

```
quick-quotes/
├── bot/                  # Discord Bot (Node.js / TypeScript)
├── transcriber/          # 文字起こしサービス (Python)
├── db/                   # MongoDB
├── broker/               # RabbitMQ の永続化データ
└── storage/              # 録音された音声ファイル (OGG)
```

### サービス一覧

| サービス    | イメージ                            | 役割                                                                    |
| ----------- | ----------------------------------- | ----------------------------------------------------------------------- |
| bot         | `node:24.14-trixie-slim`            | Discord Bot。ボイスチャンネルの音声を録音し、RabbitMQにメッセージを送信 |
| transcriber | `python:3.14-slim-trixie`           | RabbitMQからメッセージを受信し、Whisperで文字起こししてMongoDBに保存    |
| broker      | `rabbitmq:3.12.2-management-alpine` | メッセージキュー                                                        |
| db          | `mongo:4.4.23`                      | 文字起こし結果の永続化                                                  |

## データの流れ

```
Discordボイスチャンネル
  │
  │ ユーザーが発言
  ▼
[bot] 音声ストリームを受信 → OGGファイルとしてstorage/に保存
  │
  │ ファイル名・ユーザー情報をJSONで送信
  ▼
[broker] RabbitMQ (recordedキュー)
  │
  │ メッセージを配信
  ▼
[transcriber] OGGファイルをWhisperで文字起こし
  │
  │ 結果を保存
  ▼
[db] MongoDB
  │
  │ /lookbackコマンドで取得
  ▼
Discordテキストチャンネル
```

## ライセンス

[MIT License](./LICENSE)
