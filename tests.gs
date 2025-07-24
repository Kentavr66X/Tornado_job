function testOnChange() {
  try {
    // Подготовка тестовых данных
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Наряды");
    
    // Установка тестовых значений
    sheet.getRange(3, 1).setValue(-1); // A3
    sheet.getRange(3, 2).setValue("15.07.2025"); // B3
    sheet.getRange(3, 3).setValue("POST_1"); // C3
    
    // Создание mock-объекта события
    const mockEvent = {
      source: ss,
      range: {
        getColumn: () => 2,
        getRow: () => 3,
        columnStart: 2,
        rowStart: 3
      }
    };
    
    // Вызов тестируемой функции
    onChange(mockEvent);
    
    console.log("Тест testOnChange выполнен успешно");
  } catch (error) {
    logError("testOnChange", error);
    throw error;
  } finally {
    // Очистка тестовых данных
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Наряды");
    sheet.getRange(3, 1, 1, 3).clear();
  }
}

function testCallback() {
  try {
    const mockCallback = {
      data: "accept_3_POST_1",
      from: { id: "123456789" },
      message: {
        text: "Новый наряд:\nДата: 15.07.2025\nПост: POST_1"
      }
    };
    
    handleCallbackQuery(mockCallback);
    console.log("Тест testCallback выполнен успешно");
  } catch (error) {
    logError("testCallback", error);
    throw error;
  }
}
function runAllTests() {
  testOnChange();
  testCallback();
}
function logError(testName, error) {
  console.error(`[ERROR] ${testName}:`, error.message, error.stack);
}
