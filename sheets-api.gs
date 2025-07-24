var SheetsApi = {
  getSheet: function(name) {
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  },

  getCellValue: function(row, col, sheetName = "Наряды") {
    return this.getSheet(sheetName).getRange(row, col).getValue();
  },

  getPostDetails: function(postName) {
    var sheet = this.getSheet("Список постов");
    var data = sheet.getDataRange().getValues();
    
    for (var i = 0; i < data.length; i++) {
      if (data[i][1] === postName) {
        return [
          "Пост: " + data[i][1],
          "Адрес: " + data[i][2],
          "Режим: " + data[i][3],
          "Оплата: " + data[i][6]
        ].join("\n");
      }
    }
    return "Детали не найдены";
  },

  getGuardInfo: function(userId) {
    var data = this.getSheet("Охранники").getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(userId)) {
        return {
          fio: data[i][5],
          phone: data[i][6]
        };
      }
    }
    return null;
  },

  processOrderResponse: function(callbackData, fio, phone) {
    var parts = callbackData.split("_");
    var logData = {
      id: parts[1],
      date: parts.slice(2, -1).join("."),
      post: parts[parts.length-1].replace(/_/g, " "),
      fio: fio,
      phone: phone,
      time: Utilities.formatDate(new Date(), "GMT+3", "dd.MM.yyyy HH:mm"),
      status: parts[0] === "accept" ? "принял" : "отказался"
    };
    
    this.getSheet("Журнал принятий").appendRow([
      logData.id,
      logData.date,
      logData.post,
      logData.fio,
      logData.phone,
      logData.time,
      logData.status
    ]);
    
    return logData;
  }
};