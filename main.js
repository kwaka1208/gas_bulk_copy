let panelSheet;
let _maxRuntimeMs;
let workSheet;
let srcFolderId;
let dstFolderId;
let srcFolderUrl;
let dstFolderUrl;
let notifyEmail;

/**
 * 新規コピーを開始する。確認後にコピー先を空にしてシートを初期化する。
 */
function NewCopy() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    "新規コピー",
    "コピー先フォルダの内容を削除して最初からコピーします。よいですか？",
    ui.ButtonSet.YES_NO,
  );
  if (res !== ui.Button.YES) return;

  deleteContinueTriggers();
  setup();

  try {
    emptyFolder(dstFolderUrl);
  } catch (e) {
    showAlert("エラー：" + e);
    return;
  }
  initSheet();

  sendEmail(
    "Google Drive コピー開始",
    "コピーを開始しました。\n\nコピー元: " +
      srcFolderUrl +
      "\nコピー先: " +
      dstFolderUrl,
  );

  _runPhases(new Date());
}

/**
 * コピーを途中から再開する。タイムアウト時の自動トリガーもこの関数を呼ぶ。
 */
function ContinueCopy() {
  deleteContinueTriggers();
  setup();

  const phase = detectPhase();
  if (phase === PHASE.DONE || workSheet.getLastRow() <= 1) {
    // UIから呼ばれた場合のみメッセージ表示
    try {
      SpreadsheetApp.getUi().alert(
        "コピーは完了済みか未開始です。\n「新規実行」から開始してください。",
      );
    } catch (e) {
      // トリガー実行時は何もしない
    }
    return;
  }

  _runPhases(new Date());
}

/**
 * 3フェーズを順番に実行する。タイムアウト時は自動継続をスケジュールして終了。
 * @param {Date} startTime - 実行開始時刻
 */
function _runPhases(startTime) {
  // フェーズ1: コピー元フォルダのスキャン
  if (detectPhase() === PHASE.SCAN) {
    const startRow = getLastRowInCol(workSheet, COL.SCANNED) + 1;
    if (!createSrcFolderList(workSheet, startRow, startTime)) {
      scheduleContinuation();
      return;
    }
  }

  // フェーズ2: コピー先フォルダ構造の作成
  if (detectPhase() === PHASE.CREATE_FOLDERS) {
    const startRow = getLastRowInCol(workSheet, COL.DST_FOLDER_URL) + 1;
    if (!createNewTree(startRow, startTime)) {
      scheduleContinuation();
      return;
    }
  }

  // フェーズ3: ファイルのコピー
  if (detectPhase() === PHASE.COPY_FILES) {
    let sheetRow = findResumeCopyRow();
    while (workSheet.getRange(sheetRow, COL.URL).getValue() !== "") {
      if (isTimeoutApproaching(startTime)) {
        scheduleContinuation();
        return;
      }
      if (!copyFiles(workSheet, sheetRow, startTime)) {
        scheduleContinuation();
        return;
      }
      sheetRow++;
    }
  }

  showAlert("コピーが完了しました");
  sendEmail(
    "Google Drive コピー完了",
    "コピーが完了しました。\n\nコピー元: " +
      srcFolderUrl +
      "\nコピー先: " +
      dstFolderUrl,
  );
}

function initSheet() {
  workSheet.getRange("A:G").clearContent();
  workSheet.getRange(1, 1, 1, 7).setValues([
    [
      "コピー元スキャン",
      "コピー元フォルダ名",
      "コピー元フォルダURL",
      "ファイル数",
      "コピー済みファイル数",
      "コピー先フォルダURL",
      "親行番号",
    ],
  ]);
  const rootFolder = DriveApp.getFolderById(srcFolderId);
  workSheet
    .getRange(2, COL.NAME, 1, 3)
    .setValues([[rootFolder.getName(), srcFolderUrl, getFileCount(rootFolder)]]);
}

function detectPhase() {
  const lastRow = workSheet.getLastRow();
  if (lastRow <= 1) return PHASE.SCAN;

  const data = workSheet.getRange(2, 1, lastRow - 1, 6).getValues();

  for (let i = 0; i < data.length; i++) {
    if (
      data[i][COL.URL - 1] !== "" &&
      data[i][COL.SCANNED - 1] !== MARK_COMPLETE
    ) {
      return PHASE.SCAN;
    }
  }
  for (let i = 0; i < data.length; i++) {
    if (data[i][COL.DST_FOLDER_URL - 1] === "") {
      return PHASE.CREATE_FOLDERS;
    }
  }
  for (let i = 0; i < data.length; i++) {
    const fileCount = Number(data[i][COL.FILE_COUNT - 1]) || 0;
    const filesCopied = Number(data[i][COL.FILES_COPIED - 1]) || 0;
    if (filesCopied < fileCount) return PHASE.COPY_FILES;
  }

  return PHASE.DONE;
}

function findResumeCopyRow() {
  const row = getLastRowInCol(workSheet, COL.FILES_COPIED);
  if (row <= 1) return 2;
  const totalFiles =
    Number(workSheet.getRange(row, COL.FILE_COUNT).getValue()) || 0;
  const copiedFiles =
    Number(workSheet.getRange(row, COL.FILES_COPIED).getValue()) || 0;
  return totalFiles === copiedFiles ? row + 1 : row;
}

function isTimeoutApproaching(startTime) {
  if (_maxRuntimeMs === undefined) {
    _maxRuntimeMs = getMaxRuntimeMs();
  }
  return new Date() - startTime > _maxRuntimeMs;
}

/**
 * アカウント種別を判定して実行時間の上限をミリ秒で返す。
 * UIから実行した場合はメールアドレスで判定し結果をPropertiesに保存する。
 * トリガー実行時はPropertiesの保存値を使用し、不明なら保守的な値を返す。
 * @returns {number} 安全停止までのミリ秒
 */
function getMaxRuntimeMs() {
  const WORKSPACE_MS = 28 * 60 * 1000; // Workspace: 30分制限 → 28分で停止
  const CONSUMER_MS = 5 * 60 * 1000; // 無料: 6分制限 → 5分で停止
  const props = PropertiesService.getScriptProperties();

  const email = Session.getActiveUser().getEmail();
  if (email !== "") {
    const isWorkspace =
      !email.endsWith("@gmail.com") && !email.endsWith("@googlemail.com");
    props.setProperty("isWorkspace", String(isWorkspace));
    console.log(
      "アカウント種別: " +
        (isWorkspace ? "Workspace（上限28分）" : "無料（上限5分）"),
    );
    return isWorkspace ? WORKSPACE_MS : CONSUMER_MS;
  }

  const stored = props.getProperty("isWorkspace");
  if (stored !== null) {
    return stored === "true" ? WORKSPACE_MS : CONSUMER_MS;
  }

  console.log("アカウント種別不明のため保守的な上限（5分）を使用");
  return CONSUMER_MS;
}

function scheduleContinuation() {
  ScriptApp.newTrigger("ContinueCopy").timeBased().after(60 * 1000).create();
  console.log("タイムアウトのため1分後に自動継続します");
}

function deleteContinueTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "ContinueCopy") {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function showAlert(message) {
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    console.log(message);
  }
}

/**
 * 通知メールを送信する。notifyEmailが空なら何もしない。
 * @param {string} subject - 件名
 * @param {string} body - 本文
 */
function sendEmail(subject, body) {
  if (!notifyEmail) return;
  try {
    MailApp.sendEmail(notifyEmail, subject, body);
  } catch (e) {
    console.error("メール送信に失敗: " + e.message);
  }
}

/**
 * エラーをコンソールとエラーログシートに記録する。
 * @param {string} phase - 発生フェーズ（PHASE定数）
 * @param {number} row - 対象シートの行番号
 * @param {string} message - エラー内容
 */
function logError(phase, row, message) {
  console.error("[" + phase + "] 行" + row + ": " + message);
  try {
    const wb = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = wb.getSheetByName(SHEET_NAME.ERROR_LOG);
    if (!sheet) {
      sheet = wb.insertSheet(SHEET_NAME.ERROR_LOG);
      sheet
        .getRange(1, 1, 1, 4)
        .setValues([["日時", "フェーズ", "行番号", "エラー内容"]]);
    }
    sheet.appendRow([new Date(), phase, row, message]);
  } catch (e) {
    console.error("エラーログの記録に失敗: " + e.message);
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("追加機能")
    .addItem("新規実行", "NewCopy")
    .addItem("継続実行", "ContinueCopy")
    .addToUi();
}
