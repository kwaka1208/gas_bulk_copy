let spreadsheet // スプレッドシート
let panelSheet  // パネルシート
let workSheet   // フォルダリストシート
let srcFolderId // コピー元フォルダ
let dstFolderId // コピー先フォルダ
let srcFolderUrl // コピー元フォルダ
let dstFolderUrl // コピー先フォルダ
let startRow
let unitRow

const PATH_DELIMITER = "/_/_/"
const FOLDER_DELIMITER = "----------"
const MARK_COMPLETE = "済"

const COL = {
  SCANNED: 1,
  FOLDER_COPIED: 2,
  FILES_COPIED: 3,
  NAME : 4,   // フォルダ名
  URL : 5,     // フォルダID
  FILE_COUNT : 6,
  DST_FOLDER_URL : 7,
}

const PANEL = {
  SRC_FOLDER: "B1",
  DST_FOLDER: "B2",
  TARGET: "B3",
}

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
    "ファイルコピー",
    "コピー元フォルダ名",
    "コピー元フォルダURL",
    "ファイル数",
    "コピー先フォルダURL",
  ]
  workSheet.getRange(1, 1, 1, index.length).setValues([index])
  workSheet.getRange(2, COL.URL).setValue(panelSheet.getRange(PANEL.SRC_FOLDER).getValue())
  srcFolder = DriveApp.getFolderById(getFolderIdByURL(panelSheet.getRange(PANEL.SRC_FOLDER).getValue()))
  workSheet.getRange(2, COL.NAME).setValue(srcFolder.getName())
  // workSheet.getRange(2, COL.NAME).setValue(FOLDER_DELIMITER)

  // コピー元フォルダのフォルダリストを作成
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
  createNewTree(getLastRowInCol(workSheet, COL.FOLDER_COPIED) + 1)
  SpreadsheetApp.getUi().alert('コピー先フォルダの作成を完了しました')
}

function CopyAllFiles() {
  setup()
  // フォルダリストを元に各フォルダ間でファイルのみコピーする
  sheetRow = getLastRowInCol(workSheet, COL.FILES_COPIED) + 1
  while(workSheet.getRange(sheetRow, COL.URL).getValue() != "") {
    var count  = copyFiles(getFolderIdByURL(workSheet.getRange(sheetRow, COL.URL).getValue()),
              getFolderIdByURL(workSheet.getRange(sheetRow, COL.DST_FOLDER_URL).getValue()))
    workSheet.getRange(sheetRow, COL.FILE_COUNT).setValue(count)
    workSheet.getRange(sheetRow, COL.FILES_COPIED).setValue(MARK_COMPLETE)
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
