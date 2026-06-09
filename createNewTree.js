/**
 * コピー先フォルダにコピー元と同じフォルダ構造を作成する。
 * 全データを一括読み込みしてメモリ内で親子関係を解決することで
 * シートへのAPI呼び出し回数を大幅に削減する。
 * @param {number} sheetRow_ - 処理開始行番号
 * @param {Date} [startTime_] - タイムアウト判定用の開始時刻
 * @returns {boolean} 完了した場合true、タイムアウトの場合false
 */
function createNewTree(sheetRow_, startTime_) {
  const lastRow = workSheet.getLastRow()
  if (sheetRow_ > lastRow) return true

  // 全行データを一括読み込み（列1〜PARENT_ROW）
  const allData = workSheet.getRange(1, 1, lastRow, COL.PARENT_ROW).getValues()

  // 処理済み行のDST_FOLDER_URLをキャッシュ（親フォルダ参照をシートなしで解決するため）
  const dstUrlCache = {}
  for (let r = 1; r <= lastRow; r++) {
    const url = allData[r - 1][COL.DST_FOLDER_URL - 1]
    if (url) dstUrlCache[r] = url
  }

  let row = sheetRow_
  while (row <= lastRow) {
    if (allData[row - 1][COL.URL - 1] === '') break
    if (startTime_ && isTimeoutApproaching(startTime_)) return false

    const folderName = allData[row - 1][COL.NAME - 1]
    const parentRow  = Number(allData[row - 1][COL.PARENT_ROW - 1]) || 0

    const parentDstId = (parentRow >= 2 && dstUrlCache[parentRow])
      ? getFolderIdByURL(dstUrlCache[parentRow])
      : dstFolderId

    try {
      const newFolder = createNewFolder(DriveApp.getFolderById(parentDstId), folderName)
      const newUrl = newFolder.getUrl()
      dstUrlCache[row] = newUrl
      workSheet.getRange(row, COL.DST_FOLDER_URL).setValue(newUrl)
    } catch(e) {
      logError(PHASE.CREATE_FOLDERS, row, folderName + ' - ' + e.message)
      dstUrlCache[row] = 'エラー'
      workSheet.getRange(row, COL.DST_FOLDER_URL).setValue('エラー')
    }
    row++
  }
  return true
}

/**
 * 指定フォルダ内に新しいフォルダを作成。同名フォルダがあればそれを返す。
 * @param {Folder} target - 親フォルダ
 * @param {string} folderName - 作成するフォルダ名
 * @returns {Folder} 対象フォルダ
 */
function createNewFolder(target, folderName) {
  const folders = target.getFolders()
  while (folders.hasNext()) {
    const folder = folders.next()
    if (folder.getName() === folderName) return folder
  }
  return target.createFolder(folderName)
}
