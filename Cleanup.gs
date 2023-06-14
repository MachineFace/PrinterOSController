/**
 * ----------------------------------------------------------------------------------------------------------------
 * Sheet Cleanup Class
 */
class CleanupSheet {
  constructor() {
    this.RemoveAllDuplicateRecords();
    this.FixStatuses();
  }

  /**
   * Remove All Duplicate Records
   */
  RemoveAllDuplicateRecords () {
    try {
      Object.values(SHEETS).forEach( async (sheet) => {
        console.warn(`Removing duplicate records on ---> ${sheet.getSheetName()}`);
        await this.RemoveDuplicateRecords(sheet);
      });
      return 0;
    } catch(err){
      console.error(`"RemoveAllDuplicateRecords()" failed : ${err}`);
      return 1;
    } 
  }

  /**
   * Remove Duplicate Records
   * @param {sheet} sheet
   */
  RemoveDuplicateRecords(sheet) {
    const records = [];
    let lastRow = sheet.getLastRow() - 1;
    if(lastRow <= 1) lastRow = 1;
    let numbers = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
    numbers.forEach(num => {
      if(num != null || num != undefined || num != "" || num != " ") records.push(num.toString());
    });
    
    let indexes = [];
    records.forEach( (item, index) => {
      if(records.indexOf(item) !== index) indexes.push(index + 2);
    });
    const dups = records.filter((item, index) => records.indexOf(item) !== index);
    console.warn(`${sheet.getName()} : Duplicates : ${dups.length}`);
    // Remove
    if(dups) {
      indexes.forEach(async (number) => {
        console.warn(`Sheet ${sheet.getSheetName()} @ ROW : ${number}`);
        await sheet.deleteRow(number);
        await sheet.insertRowsAfter(sheet.getMaxRows(), 1);
      });
    }
  }

  /**
   * Fix Statuses
   */
  FixStatuses() {
    try {
      console.info(`Checking Statuses....`);
      Object.values(SHEETS).forEach(sheet => {
        let posCodes = GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
        let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
        posCodes.forEach( (code, index) => {
          switch(code) {
            case STATUS.queued.statusCode:
              if (statuses[index + 2] != STATUS.queued.plaintext) {
                SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.queued.plaintext);
                console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
              }
              break;
            case STATUS.inProgress.statusCode:
              if (statuses[index + 2] != STATUS.inProgress.plaintext) {
                SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.inProgress.plaintext);
                console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
              }
              break;
            case STATUS.failed.statusCode:
              if (statuses[index + 2] != STATUS.failed.plaintext) {
                SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.failed.plaintext);
                console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
              }
              break;
            case STATUS.cancelled.statusCode:
              if (statuses[index + 2] != STATUS.cancelled.plaintext) {
                SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.cancelled.plaintext);
                console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
              }
              break;
            case STATUS.complete.statusCode:
              if (statuses[index + 2] != STATUS.complete.plaintext) {
                SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.complete.plaintext);
                console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
              }
              break;
          }
        });
      })
      console.warn(`Statuses Checked and Fixed....`);
      return 0;
    } catch(err) {
      console.error(`"FixStatuses()" failed : ${err}`);
      return 1;
    }
  }
}
const RunCleanup = () => new CleanupSheet();



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Remove Duplicate Records
 * @TRIGGERED
 */
const TriggerRemoveDuplicates = () => {
  try {
    Object.values(SHEETS).forEach(sheet => {
      let idSet = new Set();
      GetColumnDataByHeader(sheet, HEADERNAMES.jobID)
        .forEach( (item, index) => {
          if(item && idSet.has(item)) {
            console.warn(`Sheet ${sheet.getSheetName()} @ ROW : ${index + 2}`);
            sheet.deleteRow(index + 2);
            sheet.insertRowsAfter(sheet.getMaxRows(), 1);
          } else idSet.add(item);
        });
    });
    return 0;
  } catch (err) {
    console.error(`"RemoveDuplicatesOnSingleSheet()" failed : ${err}`);
    return 1;
  }
}

/**
 * Clean the junk out of the filename
 * @param {string} filename
 * @return {string} fixed filename
 */
const FileNameCleanup = (filename = `Filename`) => {
  const fixed = filename
    .toString()
    .replace(/[0-9_]/g,``)
    .replace(/[.]gcode/g, ``)
    .replace(/\b[.]modified\b/g, ``)
    .replace(/[.]gcode/g, ``)
  return TitleCase(fixed).replace(` `, ``);
}

const _testFilenameCleanup = () => {
  GetColumnDataByHeader(SHEETS.Plumbus, HEADERNAMES.filename)
    .forEach(filename => {
      console.info(`BEFORE --> ${filename}`);
      const cleanup = FileNameCleanup(filename);
      console.info(`AFTER --> ${cleanup}`)
    });
  return 0;
}






