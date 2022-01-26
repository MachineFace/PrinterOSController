/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class For Logging
 */
class WriteLogger
{
  constructor() { 
    this.date = new Date().toUTCString();
    this.row = OTHERSHEETS.Logger.getLastRow() + 1;
    this.sheetLength = OTHERSHEETS.Logger.getMaxRows();
  }
  Error(message) {
    const text = [this.date, "ERROR!", message, ];
    OTHERSHEETS.Logger.appendRow(text);
    Logger.log(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Warning(message) {
    const text = [this.date, "WARNING!", message, ];
    OTHERSHEETS.Logger.appendRow(text);
    Logger.log(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Info(message) {
    const text = [this.date, "INFO!", message, ];
    OTHERSHEETS.Logger.appendRow(text);
    Logger.log(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Debug(message) {
    const text = [this.date, "DEBUG", message, ];
    OTHERSHEETS.Logger.appendRow(text);
    Logger.log(`${text[0]}, ${text[1]} : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  _PopItem() {
    if(OTHERSHEETS.Logger.getLastRow() > 100) {
      OTHERSHEETS.Logger.deleteRows(1, 1);
    } else {
      OTHERSHEETS.Logger.insertRowAfter(this.sheetLength - 1);
    }
  }
  _CleanupSheet() {
    if(this.row > 2000) {
      OTHERSHEETS.Logger.deleteRows(1, 1999);
    } else return;
  }
  
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Logger Class
 */
const _testWriteLog = () => {
  const write = new WriteLogger();
  for (let i = 0; i < 25; i++) {
    write.Warning(`Ooopsies ----> Warning`);
    write.Info(`Some Info`);
    write.Error(`ERROR`);
    write.Debug(`Debugging`);
    write._CleanupSheet();
  }
}




