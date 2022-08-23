
/**
 * =======================================================================================================================================================================
 * =======================================================================================================================================================================
 * PrinterOS Controller Script
 * Code developed by Cody Glen for Jacobs Institute for Design Innovation - UC Berkeley
 * This project creates a project-tracking and notification system for PrinterOS software.
 * Release 20210820 - Version 0.1
 * Last Updated: 20220420 - Version 2.9.0
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
  const sheetname = ss.getSheetName();

  // Fetch Columns and rows and check validity
  const thisCol = e.range.getColumn();
  const thisRow = e.range.getRow();

  // Skip the first 2 rows of data.
  if (thisRow <= 1) return;

  let thisSheetName = ss.getSheetName();
  Object.values(OTHERSHEETS).forEach(sheet => {
    if(thisSheetName == sheet.getSheetName()) return;
  });
    
  let hardID;
  Object.values(PRINTERDATA).forEach(printer => {
    if(sheetname == printer.name) hardID = printer.printerID;
  })
  console.info(`Sheet : ${sheetname} : PrinterID : ${hardID}`);

  const status = GetByHeader(ss, HEADERNAMES.status, thisRow);
  if(status == STATUS.abandoned.plaintext) {
    const email = GetByHeader(ss, HEADERNAMES.email, thisRow);
    const projectname = GetByHeader(ss, HEADERNAMES.filename, thisRow);
    const jobnumber = GetByHeader(ss, HEADERNAMES.jobID, thisRow);
    const weight = GetByHeader(ss, HEADERNAMES.weight, thisRow);
    new Emailer({
      email : email, 
      status : status,
      projectname : projectname,
      jobnumber : jobnumber,
      weight : weight,
    })
  }

  SetStatusDropdowns();
  FixStatus();
  FixMissingTickets();
  
}











