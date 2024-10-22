/**
 * ----------------------------------------------------------------------------------------------------------------
 * Class for Writing a Log
 */
class Log {
  constructor() { 

  }

  /**
   * Error Message
   * @param {string} message
   */
  static Error(message = ``) {
    try{
      const text = [ new Date().toUTCString(), "ERROR!", message, ];
      const sheet = this.prototype._GetLoggerSheet();
      sheet.appendRow(text);
      console.error(`${text[0]}, ${text[1]} : ${message}`);
      this.prototype._PopItem();
      this.prototype._CleanupSheet();
      return 0;
    } catch(err) {
      console.error(`"Error()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Warning Message
   * @param {string} message
   */
  static Warning(message = ``) {
    try{
      const text = [ new Date().toUTCString(), "WARNING", message, ];
      OTHERSHEETS.Logger.appendRow(text);
      console.warn(`${text[0]}, ${text[1]} : ${message}`);
      this.prototype._PopItem();
      this.prototype._CleanupSheet();
      return 0;
    } catch(err) {
      console.error(`"Warning()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Info Message
   * @param {string} message
   */
  static Info(message = ``) {
    try {
      const text = [ new Date().toUTCString(), "INFO", message, ];
      OTHERSHEETS.Logger.appendRow(text);
      console.info(`${text[0]}, ${text[1]} : ${message}`);
      this.prototype._PopItem();
      this.prototype._CleanupSheet();
      return 0;
    } catch(err) {
      console.error(`"Info()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Debug Message
   * @param {string} message
   */
  static Debug(message = ``) {
    try {
      const text = [ new Date().toUTCString(), "DEBUG", message, ];
      OTHERSHEETS.Logger.appendRow(text);
      console.log(`${text[0]}, ${text[1]} : ${message}`);
      this.prototype._PopItem();
      this.prototype._CleanupSheet();
      return 0;
    } catch(err) {
      console.error(`"Debug()" failed : ${err}`);
      return 1;
    }
  }

  /** 
   * Pop Item
   * @private 
   */
  _PopItem() {
    try {
      if(OTHERSHEETS.Logger.getLastRow() >= 500) OTHERSHEETS.Logger.deleteRow(2);
      return 0;
    } catch(err) {
      console.error(`"PopItem()" failed : ${err}`);
      return 1;
    }
  }
  
  /** 
   * Cleanup Sheet
   * @private 
   */
  _CleanupSheet() {
    try {
      if(OTHERSHEETS.Logger.getLastRow() > 2000) OTHERSHEETS.Logger.deleteRows(2, 1998);
      return 0;
    } catch(err) {
      console.error(`Whoops ---> ${err}`);
      return 1;
    }
  }

  /**
   * Get Logger Sheet
   * Returns logger sheet even if logger sheet doesn't exist
   * @private
   */
  _GetLoggerSheet() {
    try {
      let loggerSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`Logger`);
      if(!loggerSheet) {
        loggerSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(`Logger`);
        loggerSheet.appendRow([ `Date`, `Type`, `Message`, ]);
        return loggerSheet;
      }
      return loggerSheet;
    } catch(err) {
      console.error(`"_GetLoggerSheet()" failed : ${err}`);
      return 1;
    }
  }
  
}


