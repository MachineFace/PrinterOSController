
/**
 * Mark a job as abandoned and send an email to that student
 */
const PopUpMarkAsAbandoned = async () => {
  let ui = SpreadsheetApp.getUi(); 
  let response = ui.prompt(`Mark Print as Abandoned`, `Scan a ticket with this cell selected and press "OK".`, ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    let jobnumber = response.getResponseText();
    console.warn(`Finding ${jobnumber}`);
    let res = SheetService.FindOne(jobnumber);
    if(!res) {
      ui.alert(
        `${SERVICE_NAME}`,
        `Jobnumber : ${jobnumber} NOT FOUND. Maybe try JPS.`,
        ui.ButtonSet.OK
      );
      progressUpdate.setValue(`Job number not found. Try again.`);
      return;
    }
    let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, row, sheetName } = res;
    status = STATUS.abandoned.plaintext;
    let sheet = SHEETS[sheetName];
    SheetService.SetByHeader(sheet, HEADERNAMES.status, row, status);
    console.info(`Job ID ${jobID} marked as abandoned. Sheet: ${sheetName} row: ${row}`);
    new Emailer({
      email : email, 
      status : status,
      projectname : filename,
      jobnumber : jobID,
      weight : weight,
    })
    console.warn(`Owner ${email} of abandoned job: ${jobID} emailed...`);
    ui.alert(
      `${SERVICE_NAME} : Marked as Abandoned`, 
      `Job ID: ${jobID}: ${email} emailed... (Sheet: ${sheetName} @ Row: ${row})`, 
      ui.ButtonSet.OK
    );
  } else if (response.getSelectedButton() == ui.Button.CANCEL) {
    console.warn(`User chose not to send an email...`);
  } else {
    console.warn(`User cancelled.`);
  }
    
}

/**
 * Mark a job as abandoned and send an email to that student
 */
const PopUpMarkAsPickedUp = async () => {
  let ui = SpreadsheetApp.getUi(); 
  let response = ui.prompt(`Mark Print as Picked Up`, `Scan a ticket with this cell selected and press "OK".`, ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  if (response.getSelectedButton() == ui.Button.OK) {
    let jobnumber = response.getResponseText();
    console.warn(`Finding ${jobnumber}`);
    let res = SheetService.FindOne(jobnumber);
    if(!res) {
      ui.alert(
        `${SERVICE_NAME} `,
        `Jobnumber : ${jobnumber} NOT FOUND. Maybe try JPS.`,
        ui.ButtonSet.OK
      );
      progressUpdate.setValue(`Job number not found. Try again.`);
    }
    let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, row, sheetName } = res;
    status = STATUS.pickedUp.plaintext;
    let sheet = SHEETS[sheetName];
    SheetService.SetByHeader(sheet, HEADERNAMES.status, row, status);
    console.warn(`${email}, Job ID: ${jobID} marked as picked up... (Sheet: ${sheetName} @ Row: ${row}`);
    ui.alert(
      `Marked as Picked Up`, 
      `${email}, Job: ${jobID}... Sheet: ${sheetName} @ Row: ${row}`, 
      ui.ButtonSet.OK
    );
  } else if (response.getSelectedButton() == ui.Button.CANCEL) {
    console.warn(`User chose not to mark as picked up...`);
  } else {
    console.warn(`User cancelled.`);
  }
    
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Creates a pop-up for counting users.
 */
const PopupCountQueue = () => {
  let ui = SpreadsheetApp.getUi();
  let count = 0;
  Object.values(SHEETS).forEach(sheet => {
    let pageCount = sheet.createTextFinder(`Queued`).findAll().length;
    count = count + pageCount;
  });
  ui.alert(
    `${SERVICE_NAME}`,
    `Prints Currently in Queue : ${count}`,
    ui.ButtonSet.OK
  );
};

/**
 * Create a pop-up to Create a new Ticket if one is missing.
 */
const PopupCreateTicket = async () => {
  let ui = SpreadsheetApp.getUi();

  let thisSheet = SpreadsheetApp.getActiveSheet();
  let sheetname = thisSheet.getName();
  let thisRow = thisSheet.getActiveRange().getRow();

  if(SheetService.IsValidSheet(thisSheet) == false) {
    Browser.msgBox(
      `${SERVICE_NAME}`,
      `Bad Sheet Selected. Please select from the correct sheet. Select one cell in the row and a ticket will be created.`,
      Browser.Buttons.OK
    );
    return;
  }

  const rowData = SheetService.GetRowData(sheet, thisRow);
  let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, } = rowData;
  const imageBlob = await GetImage(picture);
  
  try {
    const ticket = await TicketService.CreateTicket({
      name : email,
      submissionTime : timestamp,
      email : email,
      printerName : printerName,
      printerID : printerID,
      weight : weight,
      jobID : jobID,
      filename : filename,
      image : imageBlob,
    });

    const url = ticket.getUrl();
    SheetService.SetByHeader(thisSheet, HEADERNAMES.ticket, thisRow, url.toString());
  } catch (err) {
    console.error(`${err} : Couldn't create a ticket.`);
  }

  ui.alert(
    `${SERVICE_NAME} Message`,
    `Ticket Created for : ${email}, @ Index : ${thisRow}, Job Number : ${jobID}`,
    ui.ButtonSet.OK
  );
};

/**
 * Builds HTML file for the modal pop-up from the help list.
 */
const BuildHTMLHELP = () => {
  let items = [
    `New Project comes into a sheet and status will automatically be set to 'Received'.`,
    `Assign yourself as the DS / SS and fill in the materials as best you can.`,
    `Change the status to 'In-Progress' when you're ready to start the project.`,
    `Wait 30 seconds for the printable ticket to generate, and print it.`,
    `Fabricate the project.`,
    `When it's done, bag the project + staple the ticket to the bag and change the status to 'Completed'.`,
    `Select any cell in the row and choose 'Generate Bill' to bill the student. The status will change itself to 'Billed'.`,
    `If you don't need to bill the student, choose 'CLOSED' status.`,
    `If you need to cancel the job, choose 'Cancelled'. `,
    `If the project can't be fabricated at all, choose 'FAILED', and email the student why it failed.`,
    `If you need student approval before proceeding, choose 'Pending Approval'. `,
    `'Missing Access' will be set automatically, and you should not choose this as an option.`,
    `If the student needs to be waitlisted for more information or space, choose 'Waitlisted'. `,
  ];
  let html = `<h2 style="text-align:center"><b> HELP MENU </b></h2>`;
  html += `<h3 style="font-family:Roboto">How to Use JPS : </h3>`;
  html += `<hr>`;
  html += `<p>Note : All status changes trigger an email to the student except for 'CLOSED' status.</p>`;
  html += `<ol style="font-family:Roboto font-size:10">`;
  items.forEach(item => html += `<li>${item}</li>`);
  html += `</ol>`;
  html += `<p>See Cody or Chris for additional help / protips.</p>`;

  console.info(html);
  return html;
};

/**
 * Creates a modal pop-up for the help text.
 */
const PopupHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = `${SERVICE_NAME} HELP`;
  let htmlOutput = HtmlService.createHtmlOutput(BuildHTMLHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

/**
 * Run Update
 */
const PopupUpdate = async () => {
  let ui = await SpreadsheetApp.getUi();
  new UpdateService();
  ui.alert(
    `${SERVICE_NAME} Message`,
    `All Info Updated from PrinterOS Server`,
    ui.ButtonSet.OK
  );
};

/**
 * Remove Duplicates
 */
const PopupRemoveDuplicates = async () => {
  let ui = await SpreadsheetApp.getUi();
  TriggerRemoveDuplicates();
  ui.alert(
    `${SERVICE_NAME} Message`,
    `All Duplicate Info from PrinterOS Server removed.`,
    ui.ButtonSet.OK
  );
};

/**
 * Fetch New Data Single Sheet
 */
const PopupFetchNewForSingleSheet = async () => {
  // let ui = await SpreadsheetApp.getUi();
  let thisSheet = SpreadsheetApp.getActiveSheet();
  WriteSingleSheet(thisSheet);
  // ui.alert(
  //   `${SERVICE_NAME} Message`,
  //   `Fetching new Data for ${thisSheet.getSheetName()} from PrinterOS Server`,
  //   ui.ButtonSet.OK
  // );
}

/**
 * Fix Missing Tickets for This Sheet
 */
PopupFixMissingTicketsForThisSheet = () => {
  let ui = SpreadsheetApp.getUi();
  let thisSheet = SpreadsheetApp.getActiveSheet();
  FixMissingTicketsForSingleSheet(thisSheet);
  // ui.alert(
  //   `${SERVICE_NAME} Message`,
  //   `Fixing Missing Tickets for ${thisSheet.getSheetName()} from PrinterOS Server`,
  //   ui.ButtonSet.OK
  // );
}

/**
 * Creates a modal pop-up for the help text.
 * @NOTIMPLEMENTED
 */
const PopupInterface = () => {
  let html = `
  <!DOCTYPE html>
  <html>
    <head>
      <script>
        function submitFeedback() {
          console.info('fname')
          alert('Your feedback was submitted successfully.', ui.ButtonSet.OK);
        }
      </script>
      <style>
        .button {
          border: none;
          color: green;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <form>
        <label for="fname">First name:</label><br>
        <input type="text" id="fname" name="fname"><br>
        <label for="lname">Last name:</label><br>
        <input type="text" id="lname" name="lname">
        <button class="button" type=submit onclick="submitFeedback() && google.script.host.close();">Submit</button>
      </form>
    </body>
  </html>
  `;
  let ui = SpreadsheetApp.getUi();
  let title = `${SERVICE_NAME}`;
  let htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

/**
 * Remove Users not in Billing List
 */
const PopupRemoveUsersNotInBillingList = async () => {
  let ui = await SpreadsheetApp.getUi();
  await RemoveStudentsWhoDidntPrint();
  ui.alert(
    `${SERVICE_NAME} Billing Cleanup`,
    `All Users Who haven't printed with us REMOVED from Billing REPORT`,
    ui.ButtonSet.OK
  );
}

/**
 * Calculate Billing
 */
const PopupCalcBilling = async () => {
  let ui = await SpreadsheetApp.getUi();
  await CalculateMaterialCostForBilling();
  ui.alert(
    `${SERVICE_NAME} Billing`,
    `Calculated Printing Costs for ALL our Users.`,
    ui.ButtonSet.OK
  );
} 

/**
 * Create a pop-up to make a new Jobnumber
 */
const PopupCreateNewId = async () => {
  const ui = await SpreadsheetApp.getUi();
  const thisSheet = SpreadsheetApp.getActiveSheet();
  let thisRow = thisSheet.getActiveRange().getRow();
  const id = IDService.createId();

  if(SheetService.IsValidSheet(thisSheet)) {
    const a = ui.alert(
      `${SERVICE_NAME}: Incorrect Sheet!`,
      `Please select from the correct sheet (eg. Laser Cutter or Fablight). Select one cell in the row and a ticket will be created.`,
      Browser.Buttons.OK,
    );
    if(a === ui.Button.OK) return;
  } 
  const { name, jobID } = SheetService.GetRowData(thisSheet, thisRow);
  if(IDService.isValid(jobID)) {
    const a = ui.alert(
      `${SERVICE_NAME}: Error!`,
      `Job ID for ${name} exists already!\n${jobID}`,
      ui.ButtonSet.OK
    );
    if(a === ui.Button.OK) return;
  }
  SheetService.SetByHeader(thisSheet, HEADERNAMES.jobnumber, thisRow, id);
  const a = ui.alert(
    `${SERVICE_NAME}:\n ID Created!`,
    `Created a New ID for ${name}:\n${id}`,
    ui.ButtonSet.OK
  );
  if(a === ui.Button.OK) return;
};


/**
 * Builds our JPS Menu and sets functions.
 * @TRIGGERED ONOPEN
 */
const BarMenu = () => {
  SpreadsheetApp.getUi()
    .createMenu(`${SERVICE_NAME} Menu`)
    // .addItem(`Barcode Scanning Tool`, `OpenBarcodeTab`)
    .addSeparator()
    .addItem(`Mark SELECTED as Abandoned`, `PopUpMarkAsAbandoned`)
    .addItem(`Mark SELECTED as Picked Up`, `PopUpMarkAsPickedUp`)
    .addSeparator()
    .addItem(`Create a Ticket for a User`, `PopupCreateTicket`)
    .addItem(`Fix All Missing Tickets`, `MissingTicketUpdater`)
    .addItem(`Fix Missing Tickets for THIS Sheet`, `PopupFixMissingTicketsForThisSheet`)
    .addItem(`Fix All Missing Filenames`, `UpdateAllFilenames`)
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu(`Administrative`)
          .addItem(`Recompute Metrics`, `Metrics`)
          .addItem(`Fetch All New Data`, `WriteAllNewDataToSheets`)
          .addItem(`Fetch All New Data for This Sheet`, `PopupFetchNewForSingleSheet`)
          .addItem(`Update All`, `PopupUpdate`)
          .addItem(`Remove Duplicate Info`, `PopupRemoveDuplicates`)
          .addItem(`Count Queue`, `PopupCountQueue`)
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu(`Billing`)
          .addItem(`HELP: How to do Semester Billing`, `PopupBillingHelp`)
          .addItem(`Generate Semester Billing Report`, `Billing`)
          .addItem(`Generate Material Costs for All Users on Billing Sheet`, `PopupCalcBilling`)
          // .addItem(`Export Billing Report CSV`,`SaveAsCSV`)
    )
    .addSeparator()
    .addItem(`Help`, `PopupHelp`)
    .addToUi();
};



/**
 * Creates a modal pop-up for the help text.
 */
const BuildBillingHELP = () => {
  let items = [
    `Check every date on every page to make sure they fall within the semester.`,
    `Note: If you don't check the dates, you might double-bill a student.`,
    `Check that there are no NaN issues on each sheet.`,
    `Click "Generate Semester Billing Report" to populate the REPORT tab.`,
    `Navigate to: "https://docs.google.com/spreadsheets/d/14QlRmAclIAwwXSPDxLoegB-qolS47sIK9Knk0HxXjWU/edit?gid=1891954171#gid=1891954171"`,
    `Create a new tab for this semester.`,
    `Copy & Paste data into that tab.`,
    `Notify Erik or Joey about completion.`,
    `Report any errors to Cody`,
  ];
  let html = `<h3 style="font-family:Roboto">How to Complete PrinterOS Billing : </h3>`;
  html += `<hr>`;
  html += `<p><b>Steps:</b></p>`;
  html += `<ol style="font-family:Roboto font-size:10">`;
  items.forEach(item => {
    html += `<li>${item}</li>`;
  });
  html += `</ol>`;
  html += `<p>See Cody for additional help / protips.</p>`;
  return html;
};
const PopupBillingHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = `${SERVICE_NAME} BILLING HELP`;
  let htmlOutput = HtmlService.createHtmlOutput(BuildBillingHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};


/**
 * Switch to scanning page.
 */
const OpenBarcodeTab = async () => {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  await spreadsheet.setActiveSheet(OTHERSHEETS.Scanner).getRange(`B3`).activate();
}


