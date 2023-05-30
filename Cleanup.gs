/**
 * ----------------------------------------------------------------------------------------------------------------
 * Sheet Cleanup Class
 */
class CleanupSheet {
  constructor() {
    this.RemoveAllDuplicateRecords();
    this.FixStatuses();
  }
  RemoveAllDuplicateRecords () {
    Object.values(SHEETS).forEach( async (sheet) => {
      try {
        console.warn(`Removing duplicate records on ---> ${sheet.getSheetName()}`);
        await this.RemoveDuplicateRecords(sheet);
      } catch(err){
        console.error(`${err} : Couldn't remove duplicates. Maybe it just took too long?...`);
      } 
    });
  }
  RemoveDuplicateRecords (sheet) {
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
  FixStatuses () {
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
  }
}
const RunCleanup = () => new CleanupSheet();



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Remove Duplicate Records
 * @TRIGGERED
 */
const TriggerRemoveDuplicates = () => {
  Object.values(SHEETS).forEach(sheet => {
    RemoveDuplicatesOnSingleSheet(sheet);
  });
}
const RemoveDuplicatesOnSingleSheet = (sheet) => {
  let indexes = [];
  try {
    if(typeof sheet != `object`) throw new Error(`Did not pass a good sheet.`);
    console.warn(`Removing duplicate records on ---> ${sheet.getSheetName()}`);
    let jobIDs = GetColumnDataByHeader(sheet, HEADERNAMES.jobID).filter(Boolean);
    jobIDs.forEach( (item, index) => {
      if(jobIDs.indexOf(item) !== index) {
        indexes.push(index + 2);
      }
    })
    const dups = jobIDs.filter((item, index) => jobIDs.indexOf(item) !== index);
    console.warn(`${sheet.getName()} : Number of Duplicates : ${dups.length}`);
    // Remove
    if(dups.length == 0) return 0; 
    indexes.forEach(number => {
      console.warn(`Sheet ${sheet.getSheetName()} @ ROW : ${number}`);
      sheet.deleteRow(number);
      sheet.insertRowsAfter(sheet.getMaxRows(), 1);
    });
    return 0;
  } catch (err) {
    console.error(`${err} : Couldn't remove duplicates. Maybe it just took too long?...`);
    return 1;
  }
}





/**
 * Clean the junk out of the filename
 */
const FileNameCleanup = (filename) => {
  const regex = /[0-9_]/g;
  const regex2 = /[.]gcode/g;
  const regex3 = /\b[.]modified\b/g;
  if(!filename) return;

  const fixed = filename
    .toString()
    .replace(regex,``)
    .replace(regex2, ``)
    .replace(regex3, ``)
    .replace(regex2, ``)
  return TitleCase(fixed).replace(` `, ``);
}

const _testFilenameCleanup = () => {
  filenames = GetColumnDataByHeader(SHEETS.Plumbus, HEADERNAMES.filename);

  filenames.forEach(filename => {
    console.info(`BEFORE --> ${filename}`);
    const cleanup = FileNameCleanup(filename);
    console.info(`AFTER --> ${cleanup}`)
  })
}