/**
 * 指定フォルダの直下にあるサブフォルダのリストを作成する
 * @param {Folder} srcFolder - Googleドライブのフォルダオブジェクト
 * @param {number} parentRow - 親フォルダのシート行番号
 * @returns {Array} [フォルダ名, URL, ファイル数, '', '', 親行番号] の配列
 */
function getFolderList(srcFolder, parentRow) {
  const srcFolders = srcFolder.getFolders()
  const folderList = []
  while (srcFolders.hasNext()) {
    const nextSrcFolder = srcFolders.next()
    folderList.push([
      nextSrcFolder.getName(),
      nextSrcFolder.getUrl(),
      getFileCount(nextSrcFolder),
      '',        // FILES_COPIED（空）
      '',        // DST_FOLDER_URL（空）
      parentRow  // PARENT_ROW
    ])
  }
  return folderList
}
