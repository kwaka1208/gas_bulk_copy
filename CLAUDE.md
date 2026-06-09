# gas_bulk_copy

Google DriveのフォルダをGoogle Apps Script（GAS）で一括コピーするツール。
Googleスプレッドシートをインターフェースとして使用するコンテナバインド型スクリプト。

## プロジェクト概要

Google Driveでは標準機能でフォルダのコピーができない制約を回避するGASツール。
スプレッドシートのカスタムメニューから操作し、フォルダ構造の複製とファイルコピーを段階的に実行する。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `main.js` | エントリーポイント。カスタムメニューと主要関数の定義 |
| `variables.js` | 定数定義（`COL`、`PANEL`、`PATH_DELIMITER`等） |
| `setup.js` | スプレッドシートとパラメータの初期化 |
| `createSrcFolderList.js` | コピー元フォルダ構造をシートにリスト化 |
| `createNewTree.js` | コピー先にフォルダ構造を再現 |
| `copyFiles.js` | 各フォルダ間でファイルをコピー |
| `getFolderList.js` | サブフォルダ一覧を取得 |
| `getFolderIdByURL.js` | URLからフォルダIDを抽出 |
| `getFileCount.js` | フォルダ内ファイル数を取得 |
| `getLastRowInCol.js` | シートの指定列の最終行を取得 |
| `emptyFolder.js` | フォルダの中身をゴミ箱へ移動 |
| `appsscript.json` | GASマニフェスト（タイムゾーン、ランタイム） |
| `.clasp.json` | clasp設定（scriptId、rootDir） |

## 操作フロー

スプレッドシートの「パネル」シートにコピー元・コピー先フォルダURLを設定し、以下の順で実行：

1. **フォルダリスト作成（新規）** → `NewCreateFolderList()`
2. **フォルダリスト作成（継続）** → `ContinueCreateFolderList()` ※タイムアウト時に再実行
3. **コピー先フォルダ作成** → `DuplicateFolders()`
4. **ファイルコピー** → `CopyAllFiles()`

## スプレッドシート構成

- **パネルシート**: `B1`=コピー元URL、`B2`=コピー先URL
- **フォルダリストシート**: 処理状態管理テーブル（`COL`定数で列を参照）

## 開発ワークフロー

```bash
make push    # ローカルの変更をGASにアップロード
make pull    # GASの最新をローカルに取得
make open    # GASスクリプトエディタをブラウザで開く
```

> `make sheet` / `make container` は `.clasp.json` に `parentId` が未設定のため動作しない。
> スプレッドシートは直接Googleドライブから開くこと。

## 注意事項

- GASの実行時間制限（6分）があるため、大量フォルダは継続実行機能で分割処理する
- `emptyFolder()` はファイル・フォルダをゴミ箱に移動する破壊的操作（`NewCreateFolderList`の冒頭で実行される）
- `PATH_DELIMITER`（`/_/_/`）でフォルダパスの階層を表現している
- フォルダ作成時、同名フォルダが既存なら新規作成をスキップする（`createNewFolder`）
- ファイルコピーはファイル名でソートして実行される
