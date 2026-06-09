/**
 * コピー元フォルダの全フォルダをシートにリスト化する
 * @param {Sheet} _targetSheet - 書き込み先シート
 * @param {number} _startRow - 処理開始行番号
 * @param {Date} [_startTime] - タイムアウト判定用の開始時刻
 * @returns {boolean} 完了した場合true、タイムアウトの場合false
 */
function createSrcFolderList(_targetSheet, _startRow, _startTime) {
  let sheetRow = _startRow
  while (true) {
    if (_startTime && isTimeoutApproaching(_startTime)) return false
    const rowData = _targetSheet.getRange(sheetRow, COL.NAME, 1, 2).getValues()[0]
    const name = rowData[0]
    const folderUrl = rowData[1]
    if (folderUrl === '') {
      if (name !== '') {
        sheetRow++
        continue
      } else {
        break
      }
    }
    let folder
    try {
      folder = DriveApp.getFolderById(getFolderIdByURL(folderUrl))
    } catch(e) {
      // resourcekey付きURLなどアクセス不可のフォルダはスキップ
      logError(PHASE.SCAN, sheetRow, folderUrl + ' - ' + e.message)
      _targetSheet.getRange(sheetRow, COL.SCANNED).setValue('スキップ')
      sheetRow++
      continue
    }
    const folderList = getFolderList(folder, sheetRow)
    if (folderList.length > 0) {
      const lastRow = getLastRowInCol(_targetSheet, COL.NAME) + 1
      _targetSheet.getRange(lastRow, COL.NAME, folderList.length, 6).setValues(folderList)
    }
    _targetSheet.getRange(sheetRow, COL.SCANNED).setValue(MARK_COMPLETE)
    sheetRow++
  }
  return true
}
