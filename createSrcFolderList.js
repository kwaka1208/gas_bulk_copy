/**
 * コピー元フォルダの全フォルダのフォルダ名とIDのリストを作成
 * @module createSrcFolderList
 */
function createSrcFolderList(_targetSheet, _startRow) {
  sheetRow = _startRow
  while(true) {
    console.log("CURRENT ROW: " + sheetRow)
    var name = _targetSheet.getRange(sheetRow,COL.NAME).getValue()
    var folderUrl = _targetSheet.getRange(sheetRow,COL.URL).getValue()
    if (folderUrl == "") {
      if (name != "") {
        // URLだけ空だったら次の行へ進む
        sheetRow++
        continue
      } else {
        // IDも名前も空だったら処理終了
        break
      }
    }
    folderList = getFolderList(name, DriveApp.getFolderById(getFolderIdByURL(folderUrl)))
    if (folderList.length > 0) {
      lastRow = getLastRowInCol(_targetSheet, COL.NAME) + 1
      console.log("LAST ROW: " + lastRow)
      console.log("LENGTH: "   + folderList.length)
      console.log(folderList)
      _targetSheet.getRange(lastRow, COL.NAME, folderList.length, 2).setValues(folderList)
      // _targetSheet.getRange(lastRow + folderList.length, COL.NAME).setValue(FOLDER_DELIMITER)
    }
    _targetSheet.getRange(sheetRow, COL.SCANNED).setValue(MARK_COMPLETE)
    sheetRow++
  }
  // while(srcFolders.hasNext()) {
  //   var nextSrcFolder = srcFolders.next()
  //   setFolderList(srcFolder.getName(), nextSrcFolder) //再帰処理
  // }
  // showMsg('完了しました')
}
