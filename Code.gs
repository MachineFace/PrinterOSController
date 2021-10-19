
/**
 * =======================================================================================================================================================================
 * =======================================================================================================================================================================
 * PrinterOS Controller Script
 * Code developed by Cody Glen for Jacobs Institute for Design Innovation - UC Berkeley
 * This project creates a project-tracking and notification system for PrinterOS software.
 * Release 20210820 - Version 0.1
 * Last Updated: 20210105 - Version 2.7.0
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
  const writer = new WriteLogger();
  const ss = e.range.getSheet();
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetname = spreadSheet.getSheetName();

  // Fetch Columns and rows and check validity
  const thisCol = e.range.getColumn();
  const thisRow = e.range.getRow();

  // Skip the first 2 rows of data.
  if (thisRow <= 1) return;
  switch (sheetname) {
    case OTHERSHEETS.Metrics.getSheetName():
    case OTHERSHEETS.Summary.getSheetName():
    case OTHERSHEETS.Scanner.getSheetName():
    case OTHERSHEETS.Staff.getSheetName():
    case OTHERSHEETS.Users.getSheetName():
    case OTHERSHEETS.Logger.getSheetName():
      return;
  }
  
  // const setCheckbox = SpreadsheetApp
  //   .newDataValidation()
  //   .requireCheckbox()
  //   .build();
  // Loop through all sheets and set validation to checkbox
  // for(const [key, sheet] of Object.entries(SHEETS)) {
  //   sheet.getRange(thisRow, 15).setDataValidation(setCheckbox);
  // }

  
  let hardID;
  for(const [name, id] of Object.entries(hardIDs)) {
    if(name == sheetname) hardID = id; 
  }
  writer.Info(`Sheet : ${sheetname} : PrinterID : ${hardID}`);

  FetchAndWrite(hardID, ss);
  RemoveDuplicateRecords(ss);
  FixStatus();
  FixMissingTickets();

}

/**
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
const sendEmail = (email, status) => {
  const Message = new CreateMessage({
    name,
    projectname,
    jobnumber,
    material1Quantity,
    material2Quantity,
    designspecialist,
    designspecialistemaillink,
  });
  // Send email with appropriate response and cc Chris and Cody.
  switch (status) {
    case STATUS.received:
      GmailApp.sendEmail(email, "Jacobs Project Support : Received", "", {
        htmlBody: Message.receivedMessage,
        from: supportAlias,
        cc: designspecialistemail,
        bcc: "",
        name: gmailName,
      });
      break;
    case STATUS.pending:
      GmailApp.sendEmail(email, "Jacobs Project Support : Needs Your Approval", "", {
          htmlBody: Message.pendingMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.inProgress:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project Started", "", {
          htmlBody: Message.inProgressMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.complete:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project Completed", "", {
          htmlBody: Message.completedMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.shipped:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project Shipped", "", {
          htmlBody: Message.shippedMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.failed:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project has Failed", "", {
          htmlBody: Message.failedMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.rejectedByStudent:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project has been Declined", "", {
          htmlBody: Message.rejectedByStudentMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.rejectedByStaff:
    case STATUS.cancelled:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project has been Cancelled", "", {
          htmlBody: Message.rejectedByStaffMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.billed:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project Closed", "", {
        htmlBody: Message.billedMessage,
        from: supportAlias,
        cc: designspecialistemail,
        bcc: "",
        name: gmailName,
      });
      break;
    case STATUS.waitlist:
      GmailApp.sendEmail(email, "Jacobs Project Support : Project Waitlisted", "", {
          htmlBody: Message.waitlistMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case STATUS.missingAccess:
      GmailApp.sendEmail(email, "Jacobs Project Support : Missing Access", "", {
          htmlBody: Message.noAccessMessage,
          from: supportAlias,
          cc: designspecialistemail,
          bcc: "",
          name: gmailName,
      });
      break;
    case "":
    case undefined:
      break;
  }
}






