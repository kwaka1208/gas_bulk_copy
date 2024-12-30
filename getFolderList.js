/**
 * 指定フォルダの中にあるフォルダのIDのリストを作成する
 * @module getFolderList
 * @param {sting} parentFolderName - GoogleフォルダのURL
 * @param {sting} srcFolder - GoogleフォルダのURL
 */
function getFolderList(parentFolderName, srcFolder){
    var srcFolders = srcFolder.getFolders()//フォルダ内フォルダをゲット
    var folderList = []
    while(srcFolders.hasNext()) {
      folderInfo = []
      nextSrcFolder = srcFolders.next()
      folderInfo[0] = parentFolderName + PATH_DELIMITER + nextSrcFolder.getName()
      folderInfo[1] = nextSrcFolder.getUrl()
      folderList.push(folderInfo)
    }
    return folderList
  }
