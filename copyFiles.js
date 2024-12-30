/**
 * コピー元フォルダからコピー先フォルダへファイルのみコピー（フォルダはコピーしない） 
 * @module copyFiles
 * @param {string} - srcFolderID コピー元フォルダのID
 * @param {string} - dstFolderID コピー先フォルダのID
 */
function copyFiles(srcFolderID_, dstFolderID_){
  var srcFolder = DriveApp.getFolderById(srcFolderID_)
  var dstFolder = DriveApp.getFolderById(dstFolderID_)
  console.log(srcFolder)
  var srcFiles = srcFolder.getFiles()//フォルダ内ファイルをゲット
  var count = 0
  while(srcFiles.hasNext()) {
    var srcFile = srcFiles.next()
    console.log(srcFile.getName())
    srcFile.makeCopy(srcFile.getName(), dstFolder)
    count++
  }
  return count
}
