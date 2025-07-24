function setWebhook() {
  var token = "8035396706:AAHfH04Cvfxyk5ZUn0kiTmYzRM_1hN7-FLQ";
  var webAppUrl = "https://script.google.com/macros/s/AKfycby1oXZkrozomGLlVW8kYIuA4ts4mxe3BENoDdPJDOOq_GqsDaN06JcuAIzb069D8DJS/exec"; // URL вашего веб-приложения
  var url = "https://api.telegram.org/bot" + token + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText()); // Должен быть {"ok":true}
}