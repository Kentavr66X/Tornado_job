var Utils = {
  generateId: function() {
    return Utilities.getUuid().substring(0, 8);
  },

  formatDate: function(date) {
    if (!date) return "Дата не указана";
    return Utilities.formatDate(new Date(date), "GMT+3", "dd.MM.yyyy");
  },

  validateEvent: function(e) {
    return e && e.source && e.range;
  },

  logError: function(context, error) {
    Logger.log(`[ERROR] ${context}: ${error.toString()}\n${error.stack}`);
  }
};