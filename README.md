# 📌 mvp-call-center-system  
_Google Apps Script × Chatwork API × Spreadsheet Trigger × clasp_

このプロジェクトは、**電話代行・コールセンター業務向けの MVP（最小実用プロダクト）** として設計されたシステムです。  
Google スプレッドシートの **「受電対応シート」** をフロントに、受電内容を自動で整形して Chatwork の指定ルームへ通知します。

- 電話対応の記録を入力すると自動で日時が入る  
- チェックボックス ON で Chatwork に自動送信  
- 送信済みフラグ、送信日時も自動管理  
- Chatwork API を利用した安定した通知処理  
- clasp × GitHub によるローカル開発 & バージョン管理

---

## 🚀 機能概要

### 1. 日付自動入力（`onEditThetime`）
「受電対応シート」の **B列** が編集されたとき、  
**A列が空なら現在日時を自動入力** します。

### 2. Chatwork への自動通知（`onEdit`）
「受電対応シート」の **G列（チェックボックス）** が ON になったとき：

- A〜F列のデータを取得  
- Chatwork に整形メッセージを送信  
- H列に送信済みフラグ（「送信済」）を記録  
- I列に送信日時を記録  

### 3. Chatwork 送信処理（`sendChatworkMessage`）
- ScriptProperties から RoomID & APIトークンを取得  
- Chatwork API v2 にメッセージを POST  
- ステータスコードをチェックし、失敗時は例外をスロー

### 4. 初期設定（`setupChatworkProperties`）
- Chatwork の RoomID / API トークンを ScriptProperties に保存  
- 本運用前に一度だけ実行

---

## 📁 シート仕様（前提）

**対象シート名：`受電対応シート`**

| 列 | 内容           |
|----|----------------|
| A  | 日時（自動入力）|
| B  | 所属           |
| C  | 名前           |
| D  | 電話番号       |
| E  | 問い合わせ事業 |
| F  | 要件           |
| G  | 送信チェックボックス |
| H  | 送信済みフラグ |
| I  | 送信日時       |

---

## 🔧 セットアップ手順（初回）

### 1. Chatwork APIトークンを取得
Chatwork の個人設定から APIトークンを発行します。

### 2. `setupChatworkProperties` を実行
GAS エディタ上で次の関数を1回だけ実行します。

```js
setupChatworkProperties();
