function onChange(e) {
  try {
    if (!Utils.validateEvent(e)) {
      Logger.log("Неверный объект события");
      return;
    }
    
    var sheet = e.range.getSheet();
    if (sheet.getName() !== "Наряды") return;
    
    var row = e.range.getRow();
    if (SheetsApi.getCellValue(row, 1) >= 0) return;
    
    var dateValue = SheetsApi.getCellValue(row, 2);
    var postValue = SheetsApi.getCellValue(row, 3);
    
    TelegramApi.sendNewOrderNotification(
      Utils.formatDate(dateValue),
      postValue,
      SheetsApi.getPostDetails(postValue)
    );
    
  } catch (error) {
    Utils.logError("onChange", error);
  }
}

function doPost(e) {
  try {
    var update = JSON.parse(e.postData.contents);
    if (update.callback_query) {
      TelegramApi.processCallback(update.callback_query);
    }
  } catch (error) {
    Utils.logError("doPost", error);
  }
}
