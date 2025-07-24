function testOnChange() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Наряды");
    
    // Тестовые данные
    var testRow = sheet.getLastRow() + 1;
    sheet.getRange(testRow, 1).setValue(-1);
    sheet.getRange(testRow, 2).setValue(new Date());
    sheet.getRange(testRow, 3).setValue("Пост_1");
    
    // Имитация события
    var e = {
      source: ss,
      range: sheet.getRange(testRow, 3),
      value: "Пост_1"
    };
    
    onChange(e);
    Logger.log("Тест onChange выполнен успешно");
  } catch (error) {
    Utils.logError("testOnChange", error);
  }
}
function testCallback() {
  try {
    var testData = {
      postData: {
        contents: JSON.stringify({
          callback_query: {
            id: "test_" + Math.random().toString(36).substring(2, 10),
            data: "accept_test123_27.07.2025_ТестовыйПост",
            from: { id: 363207547 }, // Ваш реальный ID
            message: { 
              chat: { id: -100123456 },
              message_id: Math.floor(Math.random() * 10000)
            }
          }
        })
      }
    };
    
    doPost(testData);
    Logger.log("Тест callback выполнен успешно");
  } catch (error) {
    Utils.logError("testCallback", error);
  }
}
function runAllTests() {
  testOnChange();
  testCallback();
}
