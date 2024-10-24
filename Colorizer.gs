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
    sheet = sheet ? sheet : SpreadsheetApp.getActiveSheet();
    crow = row > 2 ? row : 2;
    status = status ? status : STATUS.queued.plaintext;
    const wholerow = sheet.getRange(row, 1, 1, sheet.getLastColumn());
    try {  
      switch(status) {
        case STATUS.queued.plaintext:
          wholerow.setFontColor(null); //unset
          wholerow.setFontColor(COLORS.greenish);  //Greenish
          wholerow.setBackground(null); //unset
          wholerow.setBackground(COLORS.green_light); //Light Green
          console.warn(`Status: ${status}, Set Color to : Green`);
          break;
        case STATUS.inProgress.plaintext:
          wholerow.setFontColor(null); //unset
          wholerow.setFontColor(COLORS.orange_dark);  //Dark Yellow
          wholerow.setBackground(null); //unset
          wholerow.setBackground(COLORS.orange_light); //Light yellow
          console.warn(`Status: ${status}, Set Color to : Orange`);
          break;
        case STATUS.closed.plaintext:
        case STATUS.pickedUp.plaintext:
        case STATUS.complete.plaintext:
          wholerow.setFontColor(null); //unset
          wholerow.setFontColor(COLORS.grey);  //Gray
          wholerow.setBackground(null); //unset
          wholerow.setBackground(COLORS.grey_light); //Light Grey
          console.warn(`Status: ${status}, Set Color to : Grey`);
          break;
        case STATUS.failed.plaintext:
          wholerow.setFontColor(null); //unset
          wholerow.setFontColor(COLORS.red);  //Red
          wholerow.setBackground(null); //unset
          wholerow.setBackground(COLORS.red_light); //Light Red
          console.warn(`Status: ${status}, Set Color to : Red`);
          break;
        case STATUS.cancelled.plaintext:
          wholerow.setFontColor(null); //unset
          wholerow.setFontColor(COLORS.purple_dark);  //yellow
          wholerow.setBackground(null); //unset
          wholerow.setBackground(COLORS.purle_light); //Light yellow
          console.warn(`Status: ${status}, Set Color to : Purple`);
          break;
        case undefined:
          wholerow.setBackground(null);
          wholerow.setFontColor(null); //Unset Color
          console.warn(`Status: ${status}, Set Color to : None`);
          break;
        default:
          wholerow.setBackground(null);
          wholerow.setFontColor(null); //Unset Color
          console.warn(`Status: ${status}, Set Color to : None`);
          break;
      }    
      return 0;
    } catch(err) {
      console.error(`${err} : Couldn't color rows for some reason`);
      return 1;
    }
    
  }
}

const _testColorizer = () => {
  // ColorService.SetRowColorByStatus(SHEETS.Aurum, 2, STATUS.queued.plaintext);
  let statuses = [...Object.values(STATUS).map(status => status.plaintext)];
  console.info(statuses)
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




