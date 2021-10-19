/**
 * Class For Logging
 */
class WriteLogger
{
  constructor() { 
    this.date = new Date();
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
    Logger.log(`ERROR : ${this.date}, ${message}`);
    this._PopItem();
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
    Logger.log(`WARNING : ${this.date}, ${message}`);
    this._PopItem();
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
    Logger.log(`INFO : ${this.date}, ${message}`);
    this._PopItem();
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
    Logger.log(`DEBUG : ${this.date}, ${message}`);
    this._PopItem();
  }
  _PopItem() {
    if(this.row > 2000) {
      OTHERSHEETS.Logger.deleteRows(1, 1);
    } else return;
  }
  _CleanupSheet() {
    if(this.row > 2000) {
      OTHERSHEETS.Logger.deleteRows(1, 1999);
    } else return;
  }
  
}

const _testWriteLog = () => {
  const write = new WriteLogger();
  write.Warning(`Ooopsies ----> Warning`);
  write.Info(`Some Info`);
  write.Error(`ERROR`);
  write.Debug(`Debugging`);
  write._CleanupSheet();
}




