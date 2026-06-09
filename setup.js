/**
 * パラメータ読み込み処理
 * @module setup
 */
function setup() {
    const wb = SpreadsheetApp.getActiveSpreadsheet()
    panelSheet = wb.getSheetByName(SHEET_NAME.PANEL)
    workSheet  = wb.getSheetByName(SHEET_NAME.FOLDER_LIST)
    srcFolderUrl  = panelSheet.getRange(PANEL.SRC_FOLDER).getValue()
    dstFolderUrl  = panelSheet.getRange(PANEL.DST_FOLDER).getValue()
    notifyEmail   = panelSheet.getRange(PANEL.NOTIFY_EMAIL).getValue()
    srcFolderId = getFolderIdByURL(srcFolderUrl)
    dstFolderId = getFolderIdByURL(dstFolderUrl)
}
