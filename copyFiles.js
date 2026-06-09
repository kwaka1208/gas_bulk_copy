/**
 * コピー元フォルダからコピー先フォルダへファイルをコピーする
 * ファイル名でソートし、前回の続きから再開できる。
 * @param {Sheet} ws_ - フォルダリストシート
 * @param {number} sheetRow_ - 処理対象の行番号
 * @param {Date} [startTime_] - タイムアウト判定用の開始時刻
 * @returns {boolean} 完了した場合true、タイムアウトの場合false
 */
function copyFiles(ws_, sheetRow_, startTime_) {
  const srcFolderId = getFolderIdByURL(ws_.getRange(sheetRow_, COL.URL).getValue())
  const srcFolder = DriveApp.getFolderById(srcFolderId)
  if (!srcFolder) {
    console.error("エラー: コピー元フォルダが見つかりません。ID: " + srcFolderId)
    return true
  }

  const dstFolderId = getFolderIdByURL(ws_.getRange(sheetRow_, COL.DST_FOLDER_URL).getValue())
  const dstFolder = DriveApp.getFolderById(dstFolderId)
  if (!dstFolder) {
    console.error("エラー: コピー先フォルダが見つかりません。ID: " + dstFolderId)
    return true
  }

  const srcFilesIterator = srcFolder.getFiles()
  const filesArray = []
  while (srcFilesIterator.hasNext()) {
    filesArray.push(srcFilesIterator.next())
  }
  filesArray.sort(function(a, b) { return a.getName().localeCompare(b.getName()) })

  const startNumberVal = ws_.getRange(sheetRow_, COL.FILES_COPIED).getValue()
  const startNumber = (startNumberVal === '' || isNaN(startNumberVal)) ? 0 : Number(startNumberVal)

  for (let i = startNumber; i < filesArray.length; i++) {
    if (startTime_ && isTimeoutApproaching(startTime_)) return false
    const srcFile = filesArray[i]
    try {
      srcFile.makeCopy(srcFile.getName(), dstFolder)
      ws_.getRange(sheetRow_, COL.FILES_COPIED).setValue(i + 1)
      console.log("コピー完了: " + (i + 1) + "/" + filesArray.length + " - " + srcFile.getName())
    } catch(e) {
      logError(PHASE.COPY_FILES, sheetRow_, srcFile.getName() + ' - ' + e.message)
    }
  }
  return true
}
