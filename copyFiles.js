/**
 * コピー元フォルダからコピー先フォルダへファイルのみコピー（フォルダはコピーしない）
 * ファイル名でソートし、指定した開始番号から順にコピーを実行します。
 * コピー完了ごとに現在の進捗をログに出力します。
 *
 * @module copyFilesSorted
 * @param {string} srcFolderID_ - コピー元フォルダのID
 * @param {string} dstFolderID_ - コピー先フォルダのID
 * @param {number} startNumber_ - コピーを開始するファイルの番号 (0から始まるインデックス)
 * @returns {number} コピーしたファイルの数
 */
function copyFiles(ws_, sheetRow_){
  folderId = getFolderIdByURL(ws_.getRange(sheetRow_, COL.URL).getValue())
  var srcFolder = DriveApp.getFolderById(folderId);
  if (!srcFolder) {
    console.error("エラー: コピー元フォルダが見つかりません。ID: " + srcFolderID_);
    return 0;
  }

  folderId = getFolderIdByURL(ws_.getRange(sheetRow_, COL.DST_FOLDER_URL).getValue())
  var dstFolder = DriveApp.getFolderById(folderId);
  if (!dstFolder) {
    console.error("エラー: コピー先フォルダが見つかりません。ID: " + folderId);
    return 0;
  }

  var srcFilesIterator = srcFolder.getFiles(); // フォルダ内ファイルをゲット
  var filesArray = [];

  // Iteratorからファイルのリストを作成
  while(srcFilesIterator.hasNext()) {
    filesArray.push(srcFilesIterator.next());
  }

  // ファイル名でソート
  filesArray.sort(function(fileA, fileB) {
    return fileA.getName().localeCompare(fileB.getName());
  });

  var startNumber = ws_.getRange(sheetRow_, COL.FILES_COPIED).getValue()
  if (startNumber === "" || isNaN(startNumber)) {
    startNumber = 0; // デフォルトで0から開始
  } else {
    startNumber = Number(startNumber);
  }

  // const endValue = startNumber + 5
  const endValue = filesArray.length
  // 指定した番号から順にファイルのコピーを実行
  console.log(`To: $(endValue)`)
  for (var i = startNumber; i < endValue; i++) {
    var srcFile = filesArray[i];
    try {
      srcFile.makeCopy(srcFile.getName(), dstFolder);
      ws_.getRange(sheetRow_, COL.FILES_COPIED).setValue(i+1)
      // ログにコピー完了したファイルの番号とファイル名を出力
      console.log("コピー完了: " + (i + 1) + "件目 (" + (i + 1) + "/" + filesArray.length + ") - " + srcFile.getName());
    } catch (e) {
      console.error("エラー: ファイルのコピー中に問題が発生しました。ファイル: " + srcFile.getName() + " - " + e.message);
    }
  }
}
