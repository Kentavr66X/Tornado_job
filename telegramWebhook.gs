/**
 * Обработчик вебхука от Telegram
 * @file telegramWebhook.gs
 */

// Константы (замените на свои значения)
const TELEGRAM_BOT_TOKEN = '8035396706:AAHfH04Cvfxyk5ZUn0kiTmYzRM_1hN7-FLQ';
const TELEGRAM_CHANNEL_ID = '-1002825944844';
const TELEGRAM_GROUP_ID = '-1002813491955';

/**
 * Обработчик POST-запросов от Telegram Webhook
 * @param {Object} e - Объект события от Google Apps Script
 * @return {ContentService.TextOutput} Ответ серверу Telegram
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      console.warn("Неверный запрос:", e);
      return ContentService.createTextOutput("Invalid request");
    }

    const update = JSON.parse(e.postData.contents);
    console.log("Получен update:", JSON.stringify(update));

    // Обработка callback от кнопок
    if (update.callback_query) {
      handleCallbackQuery(update.callback_query);
      return ContentService.createTextOutput("OK");
    }

    // Обработка обычных сообщений (если нужно)
    if (update.message) {
      handleMessage(update.message);
    }

    return ContentService.createTextOutput("OK");
  } catch (error) {
    console.error("Ошибка в doPost:", error);
    return ContentService.createTextOutput("Error: " + error.message);
  }
}

/**
 * Обрабатывает нажатие на inline-кнопку
 * @param {Object} callbackQuery - Объект callback от Telegram
 */
function handleCallbackQuery(callbackQuery) {
  try {
    const data = callbackQuery.data; // "accept" или "reject"
    const userId = callbackQuery.from.id;
    const message = callbackQuery.message;
    
    console.log(`Обработка callback от ${userId}: ${data}`);

    // Находим охранника по Telegram ID
    const guard = findGuardByTelegramId(userId);
    if (!guard) {
      sendTelegramMessage(userId, "❌ Вы не найдены в списке охранников!");
      answerCallbackQuery(callbackQuery.id, "Ошибка: вы не в списке охранников");
      return;
    }

    // Парсим данные из сообщения
    const messageText = message.text || '';
    const [dateValue, post] = parseOrderDataFromMessage(messageText);
    
    if (!dateValue || !post) {
      console.warn("Не удалось разобрать данные наряда из сообщения:", messageText);
      sendTelegramMessage(userId, "❌ Ошибка: неверный формат данных наряда");
      return;
    }

    // Записываем в журнал принятий
    writeToJournal({
      dateValue: dateValue,
      post: post,
      fio: guard.fio,
      phone: guard.phone,
      status: data === 'accept' ? 'принял' : 'отказался',
      telegramId: userId
    });

    // Отправляем уведомление в группу
    sendGroupNotification({
      date: dateValue,
      post: post,
      fio: guard.fio,
      phone: guard.phone,
      status: data === 'accept' ? 'принял' : 'отказался'
    });

    // Отправляем ответ пользователю
    const responseText = data === 'accept' 
      ? `✅ Вы приняли наряд:\nДата: ${dateValue}\nПост: ${post}` 
      : `❌ Вы отказались от наряда:\nДата: ${dateValue}\nПост: ${post}`;
    
    sendTelegramMessage(userId, responseText);
    answerCallbackQuery(callbackQuery.id, responseText);

  } catch (error) {
    console.error("Ошибка в handleCallbackQuery:", error);
    answerCallbackQuery(callbackQuery.id, "Произошла ошибка при обработке запроса");
  }
}

/**
 * Ищет охранника по Telegram ID
 * @param {string} telegramId - ID пользователя в Telegram
 * @return {Object|null} Объект с данными охранника или null
 */
function findGuardByTelegramId(telegramId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Охранники");
  if (!sheet) {
    console.error("Лист 'Охранники' не найден");
    return null;
  }

  const data = sheet.getDataRange().getValues();
  // Столбцы: A(0)-Telegram ID, F(5)-ФИО, G(6)-Телефон
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(telegramId)) {
      return {
        telegramId: data[i][0],
        fio: data[i][5] || '',
        phone: data[i][6] || ''
      };
    }
  }
  return null;
}

/**
 * Записывает данные в журнал принятий
 * @param {Object} data - Данные для записи
 */
function writeToJournal(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Журнал принятий");
  if (!sheet) {
    console.error("Лист 'Журнал принятий' не найден");
    return;
  }

  const timestamp = new Date();
  const formattedDate = formatDateForSheet(new Date(data.dateValue));
  
  sheet.appendRow([
    '', // Пустая колонка A
    formattedDate,
    data.post,
    data.fio,
    data.phone,
    formatDate(timestamp),
    data.status
  ]);
}

/**
 * Отправляет уведомление в группу
 * @param {Object} data - Данные для уведомления
 */
function sendGroupNotification(data) {
  const message = `📢 Новый статус наряда:\n\n` +
    `📅 Дата: ${data.date}\n` +
    `🏢 Пост: ${data.post}\n` +
    `👤 Охранник: ${data.fio}\n` +
    `📞 Телефон: ${data.phone}\n` +
    `🔄 Статус: ${data.status}\n` +
    `⏱ Время изменения: ${formatDate(new Date())}`;

  sendTelegramMessage(TELEGRAM_GROUP_ID, message);
}

/**
 * Парсит данные наряда из текста сообщения
 * @param {string} messageText - Текст сообщения
 * @return {Array} [dateValue, post]
 */
function parseOrderDataFromMessage(messageText) {
  const dateMatch = messageText.match(/Дата:\s*(.+)/);
  const postMatch = messageText.match(/Пост:\s*(.+)/);
  
  const dateValue = dateMatch ? dateMatch[1].trim() : '';
  const post = postMatch ? postMatch[1].trim() : '';
  
  return [dateValue, post];
}

/**
 * Отправляет сообщение в Telegram
 * @param {string} chatId - ID чата
 * @param {string} text - Текст сообщения
 */
function sendTelegramMessage(chatId, text) {
  try {
    const payload = {
      method: "post",
      payload: {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      }
    };
    
    UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, payload);
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
  }
}

/**
 * Отправляет ответ на callback query
 * @param {string} callbackQueryId - ID callback query
 * @param {string} text - Текст ответа
 */
function answerCallbackQuery(callbackQueryId, text) {
  try {
    const payload = {
      method: "post",
      payload: {
        callback_query_id: callbackQueryId,
        text: text
      }
    };
    
    UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, payload);
  } catch (error) {
    console.error("Ошибка при ответе на callback:", error);
  }
}

// Вспомогательная функция для тестирования
function testWebhook() {
  const mockData = {
    postData: {
      contents: JSON.stringify({
        callback_query: {
          id: "test123",
          from: { id: "ваш_telegram_id" },
          data: "accept",
          message: {
            text: "Новый наряд:\nДата: 15.07.2025\nПост: Главный вход"
          }
        }
      })
    }
  };
  
  doPost(mockData);
}
