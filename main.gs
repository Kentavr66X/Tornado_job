/**
 * Основной файл приложения
 * @file main.gs
 */

// Инициализация при открытии таблицы
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Торнадо')
    .addItem('Отправить тестовое уведомление', 'testOnChange')
    .addItem('Установить вебхук', 'setWebhook')
    .addToUi();
}

// Установка вебхука Telegram (вызывается вручную)
function setWebhook() {
  const webhookUrl = ScriptApp.getService().getUrl();
  const payload = {
    method: "post",
    payload: {
      url: webhookUrl,
      max_connections: 5
    }
  };
  
  const response = UrlFetchApp.fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, 
    payload
  );
  
  console.log("Webhook установлен:", response.getContentText());
}

// Глобальные переменные (если не вынесены в отдельный config.gs)
const TELEGRAM_BOT_TOKEN = 'ваш_токен';
const TELEGRAM_CHANNEL_ID = '@ваш_канал';
// Проверка зависимостей
function checkDependencies() {
  try {
    if (typeof TelegramApi === 'undefined') throw new Error("TelegramApi не определён");
    if (typeof onChange === 'undefined') throw new Error("onChange не определён");
    if (typeof formatDate === 'undefined') throw new Error("formatDate не определён");
    
    console.log("✅ Все зависимости загружены корректно");
    return true;
  } catch (error) {
    console.error("❌ Ошибка зависимостей:", error);
    return false;
  }
}
