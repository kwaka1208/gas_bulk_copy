function getFileCount(folder_) {
  var files = folder_.getFiles()
  var fileCount = 0
   // ファイルイテレータをループしてファイル数をカウント
  while (files.hasNext()) {
    files.next();
    fileCount++;
  }
  return fileCount
}
