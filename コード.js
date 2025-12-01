function onEditThetime(e) {
  const sheet = e.source.getActiveSheet();
  const editedCell = e.range;
  const column = editedCell.getColumn();

  const EDITEDCELL_COLUMN = 2;
  const TIMESTAMP_COLUMN = 1;

  
  // 対象のシート名と列を指定（必要に応じて変更）
  if (sheet.getName() === "受電対応シート" && column === EDITEDCELL_COLUMN) {
    const row = editedCell.getRow();
    const timestampCell = sheet.getRange(row, TIMESTAMP_COLUMN);
    // A列が空欄なら日時を記録
    if (timestampCell.getValue() === "") {
      const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy年MM月dd日 HH:mm");
      timestampCell.setValue(now);
    }
  }
}


function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const row = range.getRow();
  const column = range.getColumn();

  // 設定するシート名と列番号を定義**ここが変更すると関数全体に支障がでるためconstで定数にて定義
  const TARGET_SHEET_NAME = "受電対応シート"; // メッセージ送信をトリガーするシート名
  const CHECKBOX_COLUMN = 7;     // チェックボックスがある列（F列）
  const SENT_FLAG_COLUMN = 8;    // 送信済フラグを記録する列（G列）
  const TIMEFLAG_COLUMN = 9;     // 送信日時を記録する列
  const DATA_START_COLUMN = 1;   // 取得するデータの開始列（A列）
  const DATA_END_COLUMN = 6;     // 取得するデータの終了列（E列）

  // 条件：対象シートかつチェックボックス列が編集された場合
  if (sheet.getName() === TARGET_SHEET_NAME && column === CHECKBOX_COLUMN) { 
    //e関数を使う上で今編集しているシートや列が対象かどうか判定し、関数を実行する条件分岐
    const checkboxValue = sheet.getRange(row, CHECKBOX_COLUMN).getValue();
    const isAlreadySent = sheet.getRange(row, SENT_FLAG_COLUMN).getValue();
    const timestampCell = sheet.getRange(row, TIMEFLAG_COLUMN); // セルオブジェクトを取得

    // チェックボックスがONになり、かつ「送信済」フラグが立っていない場合（””空の文字列）
    if (checkboxValue === true && isAlreadySent === "") {
      // 送信する行のデータ（rowdata)を取得（A列(DATA_START_COLUMN),からE列(DATA_END_COLUMN)まで）
      const now = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy年MM月dd日 HH:mm");
      timestampCell.setValue(now);
      const rowData = sheet.getRange(row, DATA_START_COLUMN, 1, DATA_END_COLUMN).getValues()[0];

      try {
        // Chatworkメッセージ送信関数を呼び出し
        sendChatworkMessage(rowData);
        // 成功した場合、G列に「送信済」フラグを設定
        sheet.getRange(row, SENT_FLAG_COLUMN).setValue("送信済");
        Logger.log(`✅ Chatworkメッセージが正常に送信されました。行: ${row}`);
      } catch (error) {
        // 送信失敗した場合
        Logger.log(`❌ Chatworkメッセージの送信に失敗しました。行: ${row}, エラー: ${error.message}`);
        // 必要であれば、エラーが発生したことをシートに記録することもできます
        // sheet.getRange(row, SENT_FLAG_COLUMN).setValue("送信失敗");
      }
    }
  }
}

function sendChatworkMessage(rowData) {
  // ScriptPropertiesから設定値を取得
  const scriptProperties = PropertiesService.getScriptProperties();
  const roomId = scriptProperties.getProperty('CHATWORK_ROOM_ID');
  const apiToken = scriptProperties.getProperty('CHATWORK_API_TOKEN');

  // 設定値が取得できない場合はエラーをスロー
  if (!roomId || !apiToken) {
    throw new Error("ChatworkのルームIDまたはAPIトークンが設定されていません。setupChatworkProperties()関数を実行してください。");
  }

  /**
   * 値が未入力または空白の場合に「（未入力）」を返すヘルパー関数です。
   * @param {any} value チェックする値
   * @returns {string} 整形された値
   */
  function sanitize(value) {
    return (!value || String(value).trim() === "") ? "（未入力）" : String(value); //value(rowdata)がnumまたは中身が空白であった場合、未入力と文に入力される
  }

  // メッセージ本文の作成
  const message = `[info]
受電報告の自動送信メッセージです。
【日時】${sanitize(rowData[0])}
【所属】${sanitize(rowData[1])}
【名前】${sanitize(rowData[2])}
【電話番号】${sanitize(rowData[3])}
【問い合わせ事業】${sanitize(rowData[4])}
【要件】${sanitize(rowData[5])}
[/info]`;

  const url = `https://api.chatwork.com/v2/rooms/${roomId}/messages`;

  const options = {
    method: "post",
    headers: {
      "X-ChatWorkToken": apiToken,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    payload: `body=${encodeURIComponent(message)}`,
    muteHttpExceptions: true // エラー発生時も例外をスローせずレスポンスを取得
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();

  // Chatwork APIからの応答をチェック
  if (responseCode >= 200 && responseCode < 300) {
    // 成功
    Logger.log("Chatwork API応答成功: " + responseText);
  } else {
    // 失敗
    throw new Error(`Chatwork APIエラー: ステータスコード ${responseCode}, 応答: ${responseText}`);
  }
}

/** 初回実行時、または設定を変更したい場合にこの関数を実行してください。*/
 
function setupChatworkProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // ここにあなたのChatworkのルームIDとAPIトークンを設定してください
  const CHATWORK_ROOM_ID = "***************"; // 例:ここの”　”ルームIDを入力してください。
  const CHATWORK_API_TOKEN = "**************"; // 例: ここの”　”を消さずにアカウントのAPIトークンをペーストしてください
  if (!CHATWORK_ROOM_ID || CHATWORK_ROOM_ID === "your_room_id_here" ||
      !CHATWORK_API_TOKEN || CHATWORK_API_TOKEN === "your_chatwork_api_token_here") {
    Logger.log("⚠️ ChatworkのルームIDまたはAPIトークンを正しく設定してください。");
    return;
  }

  scriptProperties.setProperty('CHATWORK_ROOM_ID', CHATWORK_ROOM_ID);
  scriptProperties.setProperty('CHATWORK_API_TOKEN', CHATWORK_API_TOKEN);

  Logger.log("✅ ChatworkのルームIDとAPIトークンがScriptPropertiesに設定されました。");
  Logger.log("設定されたルームID: " + CHATWORK_ROOM_ID);
  Logger.log("設定されたAPIトークン（一部表示）: " + CHATWORK_API_TOKEN.substring(0, 5) + "...");
}
