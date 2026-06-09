/**
 * Google DriveのフォルダURLからフォルダIDを取得する
 * @param {string} _url - GoogleフォルダのURL
 * @returns {string} フォルダID
 */
function getFolderIdByURL(_url) {
  const parts = _url.split('/folders/')
  if (parts.length < 2) return _url
  return parts[1].split('?')[0].split('/')[0]
}
