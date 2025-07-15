/**
 * Color Service Class for coloring rows.
 */
class ColorService {
  constructor() {
  
  }

  /**
   * Set Row Color By Status
   * @param {sheet} sheet
   * @param {number} row
   * @param {string} status
   * @returns {bool} success 
   */
  static SetRowColorByStatus(sheet, row = 2, status = STATUS.queued.plaintext) {
    try {
      if (!sheet || typeof sheet.getRange !== 'function') {
        sheet = SpreadsheetApp.getActiveSheet();
      }
      row = Number(row) >= 2 ? row : 2;
      status = status ? status : STATUS.queued.plaintext;

      const styles = {
        [STATUS.queued.plaintext]:      { bg: COLORS.green_light,  fg: COLORS.greenish,     label: "Green" },
        [STATUS.inProgress.plaintext]:  { bg: COLORS.orange_light, fg: COLORS.orange_dark,  label: "Orange" },
        [STATUS.complete.plaintext]:    { bg: COLORS.grey_light,   fg: COLORS.grey,         label: "Grey" },
        [STATUS.pickedUp.plaintext]:    { bg: COLORS.grey_light,   fg: COLORS.grey,         label: "Grey" },
        [STATUS.closed.plaintext]:      { bg: COLORS.grey_light,   fg: COLORS.grey,         label: "Grey" },
        [STATUS.failed.plaintext]:      { bg: COLORS.red_light,    fg: COLORS.red,          label: "Red" },
        [STATUS.cancelled.plaintext]:   { bg: COLORS.purle_light,  fg: COLORS.purple_dark,  label: "Purple" },
      }

      const { bg, fg, label } = styles[validStatus] || { bg: null, fg: null, label: "None" };

      const range = sheet.getRange(row, 1, 1, sheet.getLastColumn());
      range.setBackground(null).setFontColor(null);  // Clear first

      if (bg || fg) {
        if (bg) range.setBackground(bg);
        if (fg) range.setFontColor(fg);
      }

      console.warn(`Status: "${validStatus}" → Set row ${row} to color: ${label}`);
      return 0;
    } catch(err) {
      console.error(`"SetRowColorByStatus()" failed: ${err}`);
      return 1;
    }
    
  }
}

const _testColorizer = () => {
  ColorService.SetRowColorByStatus(SHEETS.Aurum, 2, STATUS.queued.plaintext);
  // let statuses = [...Object.values(STATUS).map(status => status.plaintext)];
  // console.info(statuses)
}



/**
 * Set the Conditional Formatting for each page
 * @TRIGGERED
 */
const SetConditionalFormatting = () => {
  // let statuses = [...Object.values(STATUS).map(status => status.plaintext)];
  Object.values(SHEETS).forEach(sheet => {
    let range = [ sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()), ];
    let rules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.queued.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.green_light)
        .setFontColor(COLORS.green_dark)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.inProgress.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.orange_light)
        .setFontColor(COLORS.orange_dark)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.cancelled.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.purle_light)
        .setFontColor(COLORS.purple)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.complete.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.grey_light)
        .setFontColor(COLORS.grey)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.closed.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.grey_light)
        .setFontColor(COLORS.grey)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.failed.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.red_light)
        .setFontColor(COLORS.red)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.pickedUp.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.grey_light)
        .setFontColor(COLORS.grey)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.abandoned.plaintext}"`)
        .setRanges(range)
        .setBackground(COLORS.yellow_light)
        .setFontColor(COLORS.yellow_dark)
        .build()
      ,
    ];
    sheet.setConditionalFormatRules(rules);
  });
}




