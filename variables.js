const MARK_COMPLETE = "済"

const PHASE = {
  SCAN: 'SCAN',
  CREATE_FOLDERS: 'CREATE_FOLDERS',
  COPY_FILES: 'COPY_FILES',
  DONE: 'DONE'
}

const SHEET_NAME = {
  PANEL: "パネル",
  FOLDER_LIST: "フォルダリスト",
  ERROR_LOG: "エラーログ"
}

const COL = {
  SCANNED: 1,
  NAME: 2,
  URL: 3,
  FILE_COUNT: 4,
  FILES_COPIED: 5,
  DST_FOLDER_URL: 6,
  PARENT_ROW: 7
}

const PANEL = {
  SRC_FOLDER: "B1",
  DST_FOLDER: "B2",
  NOTIFY_EMAIL: "B3"
}
