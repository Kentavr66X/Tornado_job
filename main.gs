function onChange(e) {
  // Добавляем проверку на тестовый режим
  if (typeof e === 'undefined' || e === null) {
    console.log("Тестовый вызов onChange");
    return;
  }

  // Проверяем структуру события
  if (!e.range || !e.source) {
    console.warn("Неверная структура события:", e);
    return;
  }

  const sheet = e.source.getActiveSheet();
  if (!sheet || sheet.getName() !== "Наряды") return;

  // Проверяем, что изменение было в столбцах B или C
  const column = e.range.getColumn();
  if (column < 2 || column > 3) return;

  // Получаем данные из столбца A для измененных строк
  const row = e.range.getRow();
  const colAValue = sheet.getRange(row, 1).getValue();
  
  // Проверяем условие (значение в столбце A меньше 0)
  if (colAValue >= 0) return;

  // Получаем данные поста
  const postData = getPostData(row);
  if (postData) {
    sendTelegramNotification(postData);
  }
}
function getPostData(row) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Наряды");
  const postsSheet = ss.getSheetByName("Список постов");

  if (!sheet || !postsSheet) {
    console.error("Не найдены необходимые листы");
    return null;
  }

  // Получаем данные из листа "Наряды"
  const [dateValue, postId] = sheet.getRange(row, 2, 1, 2).getValues()[0];
  
  // Получаем описание поста из "Список постов"
  const postsData = postsSheet.getDataRange().getValues();
  const postInfo = postsData.find(p => p[0] == postId);

  return {
    dateValue: dateValue,
    post: postId,
    postDescription: postInfo ? postInfo[1] : "Описание не найдено",
    row: row
  };
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
