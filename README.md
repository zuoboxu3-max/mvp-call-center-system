🚀 機能概要

✔ 1. 日付自動入力（onEditThetime）

受電対応シートの B列が編集されたとき、A列が空なら自動で日付を入れる。

✔ 2. Chatwork への自動通知（onEdit）

受電対応シートの G列（チェックボックス） が ON になったとき：

A〜F列のデータを取得

Chatwork に整形メッセージを送信

H列に送信済みフラグを記録

I列に送信日時を記録

✔ 3. Chatwork API 送信処理（sendChatworkMessage）

ScriptProperties から RoomID & Token を取得

Chatwork API v2 へ POST

エラー時はログ出力・例外スロー

✔ 4. 初期設定（setupChatworkProperties）

RoomID と API トークンを ScriptProperties に保存

トリガーや本番運用の前に必ず実行


📁 シート仕様（前提）

対象シート名：受電対応シート

列	内容
A	日時（自動入力）
B	所属
C	名前
D	電話番号
E	問い合わせ事業
F	要件
G	送信チェックボックス
H	送信済みフラグ
I	送信日時

🔧 セットアップ手順（初回のみ）
1. Chatwork API Token を取得

Chatwork → 個人設定 → API から発行。

2. プロジェクトに設定値を適用

GAS エディタで次を実行：

setupChatworkProperties();

3. トリガー設定

スプレッドシートの編集イベントを拾うため、
GAS → トリガー → 追加：

項目	設定
実行する関数	onEdit
イベントの種類	スプレッドシートの編集時
権限	必要に応じて許可
📤 Chatwork通知メッセージ仕様

送信されるメッセージのフォーマット：

[info]
受電報告の自動送信メッセージです。
【日時】〇〇
【所属】〇〇
【名前】〇〇
【電話番号】〇〇
【問い合わせ事業】〇〇
【要件】〇〇
[/info]


未入力の欄は「（未入力）」として整形されます。
