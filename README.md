# 防彈出新分頁

感謝 nike 大

一個 Tampermonkey 使用者腳本，阻止點擊播放鍵時跳出新分頁或彈窗廣告。

## 功能

- 封鎖 `window.open`，並回傳假的視窗物件，避免網站腳本因此報錯
- 攔截點擊指向外部網域的 `target="_blank"` 連結
- 攔截腳本動態建立 `<a>` 後呼叫 `.click()` 的手法
- 攔截以 `dispatchEvent` 模擬的點擊事件
- 攔截 `target="_blank"` 的表單送出

站內連結不受影響，只有指向外部網域的新分頁會被擋下。

## 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/) 擴充功能
2. 開啟 Tampermonkey 管理面板，新增腳本
3. 將 [`xxxx-no-popup.user.js`](xxxx-no-popup.user.js) 的內容貼上並儲存
4. 重新整理頁面即可生效

## 偵錯

每次攔截都會在瀏覽器主控台（F12 → Console）輸出 `[防彈窗]` 開頭的記錄，可用來確認腳本是否正常運作。

## 授權

[MIT](LICENSE)
