/**
 * 指定フォルダの中を空にする
 * @module emptyFolder
 * @param {string} folderUrl_ - 空にするフォルダのURL
 */
function emptyFolder(folderUrl_) {
  folderId_ = getFolderIdByURL(folderUrl_)
  try {
    var targetFiles = DriveApp.getFolderById(folderId_).getFiles()//フォルダ内ファイルをゲット
    while(targetFiles.hasNext()) {
      var targetFile = targetFiles.next()
      console.log(targetFile.getName())
       DriveApp.getFileById(targetFile.getId()).setTrashed(true)
    }
    var targetFolders = DriveApp.getFolderById(folderId_).getFolders()//フォルダ内フォルダをゲット
    while(targetFolders.hasNext()) {
      var targetFolder = targetFolders.next()
      console.log(targetFolder.getName())
      DriveApp.getFolderById(targetFolder.getId()).setTrashed(true)
    }
  }
  catch(e) {
    // 削除するものがなかったら例外が起こるかもしれないけど無視する。
    // showMsg(e)
  }
}
