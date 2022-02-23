/**
 * Colorizer Class for coloring rows.
 */
class Colorizer
{
  constructor({ rowNumber = 2, status = STATUS.queued }) {
    this.rowNumber = rowNumber;
    this.status = status;
    this.wholerow = SpreadsheetApp.getActiveSheet().getRange(rowNumber, 1, 1, SpreadsheetApp.getActiveSpreadsheet().getLastColumn());
    this.SetRowColorByStatus();
  }

  async SetRowColorByStatus () {
    if(this.rowNumber <= 1) return;
    try {  
      switch(this.status) {
        case STATUS.queued:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.greenish);  //Greenish
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.green_light); //Light Green
          console.warn(`Status: ${this.status}, Set Color to : Green`);
          break;
        case STATUS.inProgress:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.orange_dark);  //Dark Yellow
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.orange_light); //Light yellow
          console.warn(`Status: ${this.status}, Set Color to : Orange`);
          break;
        case STATUS.closed:
        case STATUS.pickedUp:
        case STATUS.complete:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.grey);  //Gray
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.grey_light); //Light Grey
          console.warn(`Status: ${this.status}, Set Color to : Grey`);
          break;
        case STATUS.failed:
          this.wholerow.setFontColor(null); //unset
          this.wholerow.setFontColor(COLORS.red);  //Red
          this.wholerow.setBackground(null); //unset
          this.wholerow.setBackground(COLORS.red_light); //Light Red
          console.warn(`Status: ${this.status}, Set Color to : Red`);
          break;
        case STATUS.cancelled:
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