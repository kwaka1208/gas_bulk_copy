/**
 * Google DriveのフォルダのURLからフォルダIDを取得する
 * @module getFolderIdByURL
 * @param {string} - _url GoogleフォルダのURL
 */
function getFolderIdByURL(_url) {
    return _url.split('/folders/')[1]
  }
