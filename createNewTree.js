/**
 * コピー先フォルダの中にコピー元フォルダと同じフォルダ構造とIDのリストを作成する。
 * @module createNewTree
 * @param {string} - srcFolderID コピー元フォルダのID
 * @param {string} - dstFolderID コピー先フォルダのID
 */
function createNewTree(sheetRow_) {
    setup()
    while(workSheet.getRange(sheetRow_, COL.URL).getValue() != "") {
      list = workSheet.getRange(sheetRow_, COL.NAME).getValue()
      target = createTree(dstFolderId, list.toString().split(PATH_DELIMITER))
      workSheet.getRange(sheetRow_, COL.DST_FOLDER_URL).setValue(target.getUrl())
      workSheet.getRange(sheetRow_, COL.FOLDER_COPIED).setValue(MARK_COMPLETE)
      sheetRow_++
    }
  }

/**
 * コピー先フォルダの中にコピー元フォルダと同じフォルダ構造とIDのリストを作成する。
 * @module createTree
 * @param {string} - srcFolderID コピー元フォルダのID
 * @param {string} - dstFolderID コピー先フォルダのID
 */
function createTree(targetFolderID, folderList) {
  console.log(folderList)
  target = DriveApp.getFolderById(targetFolderID)
  for (const folder of folderList) {
    console.log(folder)
    target = createNewFolder(target, folder)
  }
  return target
}

/**
 * 指定フォルダ内に新しいフォルダを作成。既に同名のフォルダがあればそれを使う。
 * @module createNewFolder
 * @param {string} - target コピー元フォルダのID
 * @param {string} - folderName コピー先フォルダのID
 */
function createNewFolder(target, folderName){
  var folders = target.getFolders()
  while(folders.hasNext()) {
    var folder = folders.next()
    if (folder.getName() == folderName ) {
      console.log(folderName +"作成をスキップ")
      return folder
    }
  }
  folder = target.createFolder(folderName)
  return folder
}
