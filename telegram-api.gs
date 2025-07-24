var TelegramApi = {
  BOT_TOKEN: "1448643153:AAG3FHYa67wlx7-lmclUMVIROlA6ziA1OwE",
  CHANNEL_ID: "-1002825944844",
  GROUP_ID: "-1002813491955",

  sendNewOrderNotification: function(date, post, details) {
    var message = `⚠️ Новый наряд!\n📅 ${date}\n${details}`;
    var keyboard = {
      inline_keyboard: [[
        { 
          text: "✅ Принять", 
          callback_data: `accept_${Utils.generateId()}_${date}_${post}`
        },
        { 
          text: "❌ Отказаться", 
          callback_data: `reject_${Utils.generateId()}_${date}_${post}`
        }
      ]]
    };
    
    this._sendMessage(this.CHANNEL_ID, message, keyboard);
  },

  processCallback: function(callback) {
    this.answerCallback(callback.id, "⌛ Обработка...");
    setTimeout(() => this._processCallbackAsync(callback), 1);
  },

  _processCallbackAsync: function(callback) {
    try {
      var action = callback.data.split("_")[0];
      var userId = callback.from.id;
      var guard = SheetsApi.getGuardInfo(userId);
      
      if (!guard) {
        this.answerCallback(callback.id, "❌ Вас нет в списке");
        return;
      }
      
      var logData = SheetsApi.processOrderResponse(
        callback.data,
        guard.fio,
        guard.phone
      );
      
      if (action === "accept") {
        this._sendMessage(
          this.GROUP_ID,
          `✅ Принят наряд\n📅 ${logData.date}\n👤 ${guard.fio}`
        );
      }
      
      this.answerCallback(
        callback.id,
        action === "accept" ? "✅ Принято!" : "❌ Отказано"
      );
      
    } catch (error) {
      Utils.logError("_processCallbackAsync", error);
      this.answerCallback(callback.id, "⚠️ Ошибка обработки");
    }
  },

  _sendMessage: function(chatId, text, replyMarkup) {
    var payload = {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML"
    };
    
    if (replyMarkup) {
      payload.reply_markup = JSON.stringify(replyMarkup);
    }
    
    UrlFetchApp.fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  },

  answerCallback: function(callbackId, text) {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${this.BOT_TOKEN}/answerCallbackQuery`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        callback_query_id: callbackId,
        text: text
      }),
      muteHttpExceptions: true
    });
  }
};