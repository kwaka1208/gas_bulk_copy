/**
 * パラメータ読み込み処理
 * @module setup
 */
function setup() {
    wb = SpreadsheetApp.getActiveSpreadsheet()
    panelSheet = wb.getSheetByName("パネル")
    workSheet  = wb.getSheetByName("フォルダリスト")
    srcFolderUrl = panelSheet.getRange(PANEL.SRC_FOLDER).getValue() // コピー元フォルダ
    dstFolderUrl = panelSheet.getRange(PANEL.DST_FOLDER).getValue() // コピー先フォルダ
    srcFolderId = getFolderIdByURL(srcFolderUrl)
    dstFolderId = getFolderIdByURL(dstFolderUrl)
}
