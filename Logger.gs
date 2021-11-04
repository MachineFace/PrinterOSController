/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class For Logging
 */
class WriteLogger
{
  constructor() { 
    this.date = new Date().getTime();
    this.row = OTHERSHEETS.Logger.getLastRow() + 1;
    this.sheetLength = OTHERSHEETS.Logger.getMaxRows();
  }
  Error(message){
    if(this.row > this.sheetLength) {
      OTHERSHEETS.Logger.appendRow([
        this.date, "ERROR!", message,
      ]);
    } else {
      OTHERSHEETS.Logger.getRange(this.row, 1, 1, 1).setValue(this.date);
      OTHERSHEETS.Logger.getRange(this.row, 2, 1, 1).setValue("ERROR!");
      OTHERSHEETS.Logger.getRange(this.row, 3, 1, 1).setValue(message);
    }
    Logger.log(`ERROR : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Warning(message) {
    if(this.row > this.sheetLength) {
      OTHERSHEETS.Logger.appendRow([
        this.date, "WARNING!", message,
      ]);
    } else {
      OTHERSHEETS.Logger.getRange(this.row, 1, 1, 1).setValue(this.date);
      OTHERSHEETS.Logger.getRange(this.row, 2, 1, 1).setValue("WARNING");
      OTHERSHEETS.Logger.getRange(this.row, 3, 1, 1).setValue(message);
    }
    Logger.log(`WARNING : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Info(message) {
    if(this.row > this.sheetLength) {
      OTHERSHEETS.Logger.appendRow([
        this.date, "INFO!", message,
      ]);
    } else {
      OTHERSHEETS.Logger.getRange(this.row, 1, 1, 1).setValue(this.date);
      OTHERSHEETS.Logger.getRange(this.row, 2, 1, 1).setValue("INFO");
      OTHERSHEETS.Logger.getRange(this.row, 3, 1, 1).setValue(message);
    }
    Logger.log(`INFO : ${message}`);
    this._PopItem();
    this._CleanupSheet();
  }
  Debug(message) {
    if(this.row > this.sheetLength) {
      OTHERSHEETS.Logger.appendRow([
        this.date, "DEBUG", message,
      ]);
    } else {
      OTHERSHEETS.Logger.getRange(this.row, 1, 1, 1).setValue(this.date);
      OTHERSHEETS.Logger.getRange(this.row, 2, 1, 1).setValue("DEBUG");
      OTHERSHEETS.Logger.getRange(this.row, 3, 1, 1).setValue(message);
    }
    Logger.log(`DEBUG : ${message}`);
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
  write.Warning(`Ooopsies ----> Warning`);
  write.Info(`Some Info`);
  write.Error(`ERROR`);
  write.Debug(`Debugging`);
  write._CleanupSheet();
}




