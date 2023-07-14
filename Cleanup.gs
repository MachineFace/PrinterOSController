/**
 * ----------------------------------------------------------------------------------------------------------------
 * Sheet Cleanup Class
 */
class CleanupService {
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
    let indexes = [];
    const records = [...GetColumnDataByHeader(sheet, HEADERNAMES.jobID)]
      .filter(Boolean);
    records.forEach( (item, index) => {
      if(records.indexOf(item) !== index) indexes.push(index + 2);
    });
    const dups = records.filter((item, index) => records.indexOf(item) !== index);
    console.warn(`Removing duplicate records on ---> ${sheet.getSheetName()}, Duplicates : ${dups.length}`);
    // Remove
    if(dups) {
      indexes.forEach((number) => {
        console.warn(`Sheet ${sheet.getSheetName()} @ ROW : ${number}`);
        sheet.deleteRow(number);
        sheet.insertRowsAfter(sheet.getMaxRows(), 1);
      });
    }
  }

  /**
   * Fix Statuses
   */
  FixStatuses() {
    try {
      Object.values(SHEETS).forEach(sheet => {
        console.warn(`Checking Statuses for ${sheet.getSheetName()}....`);
        let posCodes = GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
        let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
        posCodes.forEach( (code, index) => {
          const status = GetStatusByCode(code);
          // console.info(`S: ${statuses[index]}:  Stat: ${status}, Code: ${code}`);
          if(statuses[index] != status) {
            console.info(`Found Error: Status Claimed: ${statuses[index]},  Status Actual: ${status}`);
            SetByHeader(sheet, HEADERNAMES.status, index + 2, status);
          }
        });
        console.warn(`Fixed ${sheet.getSheetName()}....`);
      })
      return 0;
    } catch(err) {
      console.error(`"FixStatuses()" failed : ${err}`);
      return 1;
    }
  }
}

/**
 * @TRIGGERED
 */
const RunCleanup = () => new CleanupService();



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
    .replace(/stlmagicfix/g, ``)
    .replace(/[.]gcode/g, ``)
  return TitleCase(fixed).replace(` `, ``);
}






