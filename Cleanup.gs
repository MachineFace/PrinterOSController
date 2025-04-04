/**
 * ----------------------------------------------------------------------------------------------------------------
 * Sheet Cleanup Class
 */
class CleanupService {
  constructor() {

  }

  /**
   * Remove All Duplicate Records
   */
  static RemoveAllDuplicateRecords() {
    try {
      Object.values(SHEETS).forEach(sheet => {
        CleanupService.RemoveDuplicateRecords(sheet);
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
  static RemoveDuplicateRecords(sheet) {
    let indexes = [];
    const records = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID)]
      .filter(Boolean);
    records.forEach( (item, index) => {
      if(records.indexOf(item) !== index) indexes.push(index + 2);
    });
    const dups = records.filter((item, index) => records.indexOf(item) !== index);
    console.warn(`Removing duplicate records on ---> ${sheet.getSheetName()}, Duplicates : ${dups.length}`);
    // Remove
    if(dups) {
      indexes.forEach((number) => {
        console.warn(`${sheet.getSheetName()} @ ROW : ${number}`);
        sheet.deleteRow(number);
        sheet.insertRowsAfter(sheet.getMaxRows(), 1);
      });
    }
  }

  /**
   * Clean the junk out of the filename
   * @param {string} filename
   * @return {string} fixed filename
   */
  static FileNameCleanup(filename = `Filename`) {
    const fixed = filename
      .toString()
      .replace(/[0-9_]/g,``)
      .replace(/[.]gcode/g, ``)
      .replace(/\b[.]modified\b/g, ``)
      .replace(/stlmagicfix/g, ``)
      .replace(/[.]gcode/g, ``)
    return TitleCase(fixed).replace(` `, ``);
  }

}

/**
 * @TRIGGERED
 */
const RunCleanup = () => CleanupService.RemoveAllDuplicateRecords();










