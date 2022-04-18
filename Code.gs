
/**
 * =======================================================================================================================================================================
 * =======================================================================================================================================================================
 * PrinterOS Controller Script
 * Code developed by Cody Glen for Jacobs Institute for Design Innovation - UC Berkeley
 * This project creates a project-tracking and notification system for PrinterOS software.
 * Release 20210820 - Version 0.1
 * Last Updated: 20211102 - Version 2.9.0
 * =======================================================================================================================================================================
 * =======================================================================================================================================================================
 */

const supportAlias = GmailApp.getAliases()[0];
const gmailName = "Jacobs Self-Service Printing Bot";


/**
 * On Change : Main Entry Point
 * Reserved word: onEdit() cannot be used here because it's reserved for simple triggers.
 * @param {Event} e
 */
const onChange = async (e) => {
  const ss = e.range.getSheet();
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetname = spreadSheet.getSheetName();

  // Fetch Columns and rows and check validity
  const thisCol = e.range.getColumn();
  const thisRow = e.range.getRow();

  // Skip the first 2 rows of data.
  if (thisRow <= 1) return;

  let thisSheetName = e.range.getSheet().getSheetName();
  Object.values(OTHERSHEETS).forEach(sheet => {
    if(thisSheetName == sheet.getSheetName()) return;
  });
    
  let hardID;
  Object.values(PRINTERDATA).forEach(printer => {
    if(sheetname == printer.name) hardID = printer.printerID;
  })
  console.info(`Sheet : ${sheetname} : PrinterID : ${hardID}`);

  SetStatusDropdowns();
  FixStatus();
  FixMissingTickets();
  
  // const status = spreadSheet.getRange(thisRow, 1, 1, 1).getValue();
  // new Colorizer({ rowNumber : thisRow, status : status, });

}











