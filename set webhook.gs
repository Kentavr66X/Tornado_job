function setWebhook() {
  const webhookUrl = 'https://script.google.com/macros/s/AKfycbxy7kghgGgGiNtQ3E_4w1YRfflKWEEBt1NgTiuiZ7aoH7Sa84o_K0w40Px3XUhXKdYa/exec';
  const payload = {
    method: "post",
    payload: {
      url: webhookUrl
    }
  };
  
  const response = UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, payload);
  console.log(response.getContentText());
}
