/**
 * 指定列の最終行を取得する
 * @param {*} _col 
 */
function getLastRowInCol(_ws, _col) {
  // 指定した列のデータを全て取得
  var columnData = _ws.getRange(1, _col, _ws.getMaxRows()).getValues()
  
  // 最後にデータがある行を逆から探す
  for (var i = columnData.length - 1; i >= 0; i--) {
    if (columnData[i][0] !== "") {
      return i + 1  // 行番号は配列のインデックス+1
    }
  }
  // データがない場合は0を返す
  return 0
}
