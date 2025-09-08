let spreadsheet // スプレッドシート
let panelSheet  // パネルシート
let workSheet   // フォルダリストシート
let srcFolderId // コピー元フォルダ
let dstFolderId // コピー先フォルダ
let srcFolderUrl // コピー元フォルダ
let dstFolderUrl // コピー先フォルダ
let startRow
let unitRow

/**
 * フォルダリストを作成
 * @module NewCreateFolderList
 */
function NewCreateFolderList() {
  setup()
  try{
    // スタート時のフォルダは中途半端な状態になっている可能性があるので残っていたら削除しておく。
    emptyFolder(dstFolderUrl)
  } catch(e) {
    SpreadsheetApp.getUi().alert('エラー：'+e)
    return
  }
  workSheet.getRange("A:H").clearContent()
  var index =  [
    "コピー元スキャン",
    "コピー先フォルダ作成",
    "コピー元フォルダ名",
    "コピー元フォルダURL",
    "ファイル数",
    "コピー済みファイル数",
    "コピー先フォルダURL"
  ]
  // 見出しをセット
  workSheet.getRange(1, 1, 1, index.length).setValues([index])

  // ルートフォルダの情報をセット
  rootFolder = DriveApp.getFolderById(srcFolderId);
  folderList = []
  folderInfo = [ rootFolder.getName(),
                 srcFolderUrl,
                 getFileCount(rootFolder)]
  folderList.push(folderInfo)
  workSheet.getRange(2, COL.NAME, 1, 3).setValues(folderList)
  // コピー元フォルダの中のフォルダリストを作成
  ContinueCreateFolderList()
}

/**
 * フォルダリストを作成（続行処理）
 * @module NewCreateFolderList
 */
function ContinueCreateFolderList() {
  setup()
  // コピー元フォルダのフォルダリストを作成を継続
  createSrcFolderList(workSheet, getLastRowInCol(workSheet, COL.SCANNED) + 1)
  SpreadsheetApp.getUi().alert('コピー元フォルダリストの作成を完了しました')
}

/**
 * コピー先フォルダを作成（新規）
 * @module NewCreateFolderList
 */
function DuplicateFolders() {
  setup()
  // フォルダリストを元にコピー先のフォルダ構造を作成する。
  createNewTree(getLastRowInCol(workSheet, COL.DST_FOLDER_URL) + 1)
  SpreadsheetApp.getUi().alert('コピー先フォルダの作成を完了しました')
}

function CopyAllFiles() {
  setup()
  // フォルダリストを元に各フォルダ間でファイルのみコピーする
  sheetRow = getLastRowInCol(workSheet, COL.FILES_COPIED)
  if (sheetRow == 1) sheetRow++ // ヘッダー行はスキップ
  totalFileCount = Number(workSheet.getRange(sheetRow, COL.FILE_COUNT).getValue())
  copiedFileCount = Number(workSheet.getRange(sheetRow, COL.FILES_COPIED).getValue())
  console.log(`最大数： ${totalFileCount} コピー済み数：${copiedFileCount}`)

  if (totalFileCount == copiedFileCount)
  {
    sheetRow++ // 最後の行がすべてコピーされていたら次の行へ
  }
  // copyFiles(workSheet, sheetRow)
  while(workSheet.getRange(sheetRow, COL.URL).getValue() != "") {
    copyFiles(workSheet, sheetRow)
    sheetRow++
  }
  SpreadsheetApp.getUi().alert('ファイルのコピーを完了しました')
}

/**
 * スプレッドシートを開いた時にメニューを追加する。
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi()           // Uiクラスを取得する
  var menu = ui.createMenu('カスタムメニュー')  // Uiクラスからメニューを作成する
  menu.addItem('フォルダリスト作成（新規）', 'NewCreateFolderList')   // メニューにアイテムを追加する
  menu.addItem('フォルダリスト作成（継続）', 'ContinueCreateFolderList')   // メニューにアイテムを追加する
  menu.addSeparator()                       // メニューにセパレータを追加する
  menu.addItem('コピー先フォルダ作成', 'DuplicateFolders')   // メニューにアイテムを追加する
  menu.addSeparator()                       // メニューにセパレータを追加する
  menu.addItem('ファイルコピー', 'CopyAllFiles')   // メニューにアイテムを追加する
  menu.addToUi()                            // メニューをUiクラスに追加する
}
