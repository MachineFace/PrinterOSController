/**
 * Colorizer Class for coloring rows.
 */
class Colorizer
{
  constructor({ 
    rowNumber : rowNumber, 
    status : status,
  }) {
    this.rowNumber = rowNumber ? rowNumber : 2;
    this.status = status ? status : STATUS.queued.plaintext;
    this.wholerow = SpreadsheetApp.getActiveSheet().getRange(rowNumber, 1, 1, SpreadsheetApp.getActiveSpreadsheet().getLastColumn());
    this.SetRowColorByStatus();
  }

  async SetRowColorByStatus () {
    if(this.rowNumber <= 1) return;
    try {  
      switch(this.status) {
        case STATUS.queued.plaintext:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.greenish);  //Greenish
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.green_light); //Light Green
          console.warn(`Status: ${this.status}, Set Color to : Green`);
          break;
        case STATUS.inProgress.plaintext:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.orange_dark);  //Dark Yellow
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.orange_light); //Light yellow
          console.warn(`Status: ${this.status}, Set Color to : Orange`);
          break;
        case STATUS.closed.plaintext:
        case STATUS.pickedUp.plaintext:
        case STATUS.complete.plaintext:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.grey);  //Gray
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.grey_light); //Light Grey
          console.warn(`Status: ${this.status}, Set Color to : Grey`);
          break;
        case STATUS.failed.plaintext:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.red);  //Red
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.red_light); //Light Red
          console.warn(`Status: ${this.status}, Set Color to : Red`);
          break;
        case STATUS.cancelled.plaintext:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.purple_dark);  //yellow
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.purle_light); //Light yellow
          console.warn(`Status: ${this.status}, Set Color to : Purple`);
          break;
        case undefined:
          this.wholerow.setBackground(null);
          this.wholerow.setFontColor(null); //Unset Color
          console.warn(`Status: ${this.status}, Set Color to : None`);
          break;
        default:
          this.wholerow.setBackground(null);
          this.wholerow.setFontColor(null); //Unset Color
          console.warn(`Status: ${this.status}, Set Color to : None`);
          break;
      }    
    } catch(err) {
      console.error(`${err} : Couldn't color rows for some reason`);
    }
    
  }
}

const _testColorizer = async () => {
  const c = new Colorizer({ rowNumber : 2, status : STATUS.queued.plaintext });
}



/**
 * Set the Conditional Formatting for each page
 */
const SetConditionalFormatting = () => {
  let statuses = [];
  Object.values(STATUS).forEach(status => statuses.push(status.plaintext));
  Object.values(SHEETS).forEach(sheet => {
    let rules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.queued.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.green_light)
        .setFontColor(COLORS.green_dark)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.inProgress.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.orange_light)
        .setFontColor(COLORS.orange_dark)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.cancelled.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.purle_light)
        .setFontColor(COLORS.purple_dark)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.complete.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.grey_light)
        .setFontColor(COLORS.grey)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.closed.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.grey_light)
        .setFontColor(COLORS.grey)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.failed.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.red_light)
        .setFontColor(COLORS.red_dark_1)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.pickedUp.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.grey_light)
        .setFontColor(COLORS.grey)
        .build()
      ,
      SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=$A2="${STATUS.abandoned.plaintext}"`)
        .setRanges([sheet.getRange(2, 1, sheet.getMaxRows(), sheet.getMaxColumns()),])
        .setBackground(COLORS.yellow_light)
        .setFontColor(COLORS.yellow_dark)
        .build()
      ,
    ];
    sheet.setConditionalFormatRules(rules);
  });
}