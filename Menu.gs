
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
    let res = FindOne(jobnumber);
    if(!res) {
      ui.alert(
        `PrinterOS`,
        `Jobnumber : ${jobnumber} NOT FOUND. Maybe try JPS.`,
        ui.ButtonSet.OK
      );
      progressUpdate.setValue(`Job number not found. Try again.`);
      return;
    } else {
      let sheet = SHEETS[res.sheetName];
      let row = res.row;
      let email = res.email;
      let projectname = res.filename;
      let weight = res.weight;
      SetByHeader(sheet, HEADERNAMES.status, row, STATUS.abandoned.plaintext);
      console.info(`Job number ${jobnumber} marked as abandoned. Sheet: ${sheet.getSheetName()} row: ${row}`);
      await new Emailer({
        email : email, 
        status : STATUS.abandoned.plaintext,
        projectname : projectname,
        jobnumber : jobnumber,
        weight : weight,
      })
      console.warn(`Owner ${email} of abandoned job: ${jobnumber} emailed...`);
      ui.alert(
        `${SERVICENAME} : Marked as Abandoned`, 
        `${email}, Job: ${jobnumber} emailed... Sheet: ${sheet.getSheetName()} row: ${row}`, 
        ui.ButtonSet.OK
      );
    }
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
    let res = FindOne(jobnumber);
    if(!res) {
      ui.alert(
        `${SERVICENAME} `,
        `Jobnumber : ${jobnumber} NOT FOUND. Maybe try JPS.`,
        ui.ButtonSet.OK
      );
      progressUpdate.setValue(`Job number not found. Try again.`);
    } else {
      let sheet = SHEETS[res.sheetName];
      let row = res.row;
      let email = res.email;
      SetByHeader(sheet, HEADERNAMES.status, row, STATUS.pickedUp.plaintext);
      console.warn(`${email}, Job: ${jobnumber} marked as picked up... Sheet: ${sheet.getSheetName()} row: ${row}`);
      ui.alert(`Marked as Picked Up`, `${email}, Job: ${jobnumber}... Sheet: ${sheet.getSheetName()} row: ${row}`, ui.ButtonSet.OK);
    }
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
const PopupCountQueue = async () => {
  let ui = await SpreadsheetApp.getUi();
  let count = await CountQueue();
  ui.alert(
    `${SERVICENAME} Message`,
    `Prints Currently in Queue : ${count}`,
    ui.ButtonSet.OK
  );
};

/**
 * Count the Number of Jobs in the Queue.
 */
const CountQueue = () => {
  let count = 0;
  Object.values(SHEETS).forEach(sheet => {
    let pageCount = sheet.createTextFinder(`Queued`).findAll().length;
    count = count + pageCount;
  });
  console.info(`Count : ${count}`);
  return count;
}



/**
 * Create a pop-up to Create a new Ticket if one is missing.
 */
const PopupCreateTicket = async () => {
  let ui = SpreadsheetApp.getUi();

  let thisSheet = SpreadsheetApp.getActiveSheet();
  let sheetname = thisSheet.getName();
  let thisRow = thisSheet.getActiveRange().getRow();

  // If It is on a valid sheet
  Object.values(OTHERSHEETS).forEach(sheet => {
    const name = sheet.getSheetName();
    if (sheetname == name) {
      Browser.msgBox(
        `Incorrect Sheet Active`,
        `Please select from the correct sheet. Select one cell in the row and a ticket will be created.`,
        Browser.Buttons.OK
      );
      return;
    }
  }) 
  

  // Loop through to get last row and set status to received
  const printerID = GetByHeader(thisSheet, HEADERNAMES.printerID, thisRow);
  const printerName = GetByHeader(thisSheet, HEADERNAMES.printerName, thisRow);
  const jobID = GetByHeader(thisSheet, HEADERNAMES.jobID, thisRow);
  const timestamp = GetByHeader(thisSheet, HEADERNAMES.timestamp, thisRow);
  const email = GetByHeader(thisSheet, HEADERNAMES.email, thisRow);
  const status = GetByHeader(thisSheet, HEADERNAMES.status, thisRow);
  const duration = GetByHeader(thisSheet, HEADERNAMES.duration, thisRow);
  const weight = GetByHeader(thisSheet, HEADERNAMES.weight, thisRow);
  const cost = GetByHeader(thisSheet, HEADERNAMES.cost, thisRow);
  const filename = GetByHeader(thisSheet, HEADERNAMES.filename, thisRow);
  const png = GetByHeader(thisSheet, HEADERNAMES.picture, thisRow);
  
  const imageBlob = await GetImage(png);
  
  try {
    const ticket = await new Ticket({
      name : email,
      submissionTime : timestamp,
      email : email,
      printerName : printerName,
      printerID : printerID,
      weight : weight,
      jobID : jobID,
      filename : filename,
      image : imageBlob,
    }).CreateTicket();

    const url = ticket.getUrl();
    SetByHeader(thisSheet, HEADERNAMES.ticket, thisRow, url.toString());
  } catch (err) {
    console.error(`${err} : Couldn't create a ticket.`);
  }

  ui.alert(
    `${SERVICENAME} Message`,
    `Ticket Created for : ${email}, @ Index : ${thisRow}, Job Number : ${jobID}`,
    ui.ButtonSet.OK
  );
};


/**
 * Builds HTML file for the modal pop-up from the help list.
 */
const BuildHTMLHELP = () => {
  let items = [
    `Note : All status changes trigger an email to the student except for 'CLOSED' status`,
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
    `See Cody or Chris for additional help + protips.`,
  ];
  let html = `<h2 style="text-align:center"><b> HELP MENU </b></h2>`;
  html += `<h3 style="font-family:Roboto">How to Use JPS : </h3>`;
  html += `<hr>`;
  html += `<p>${items[0]}</p>`;
  html += `<ol style="font-family:Roboto font-size:10">`;
  items.forEach((item, index) => {
    if (index > 0 && index < items.length - 1) {
      html += `<li>${item}</li>`;
    }
  });
  html += `</ol>`;
  html += `<p>${items[items.length - 1]}</p>`;

  console.info(html);
  return html;
};

/**
 * Creates a modal pop-up for the help text.
 */
const PopupHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = `${SERVICENAME} HELP`;
  let htmlOutput = HtmlService.createHtmlOutput(BuildHTMLHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

const PopupUpdate = async () => {
  let ui = await SpreadsheetApp.getUi();
  new UpdateSheet();
  ui.alert(
    `${SERVICENAME} Message`,
    `All Info Updated from PrinterOS Server`,
    ui.ButtonSet.OK
  );
};

const PopupRemoveDuplicates = async () => {
  let ui = await SpreadsheetApp.getUi();
  TriggerRemoveDuplicates();
  ui.alert(
    `${SERVICENAME}  Message`,
    `All Duplicate Info from PrinterOS Server removed.`,
    ui.ButtonSet.OK
  );
};

const PopupFetchNewForSingleSheet = async () => {
  let ui = await SpreadsheetApp.getUi();
  let thisSheet = SpreadsheetApp.getActiveSheet();
  FetchNewDataforSingleSheet(thisSheet);
  ui.alert(
    `${SERVICENAME} Message`,
    `Fetching new Data for ${thisSheet.getSheetName()} from PrinterOS Server`,
    ui.ButtonSet.OK
  );
}

PopupFixMissingTicketsForThisSheet = async () => {
  let ui = await SpreadsheetApp.getUi();
  let thisSheet = SpreadsheetApp.getActiveSheet();
  FixMissingTicketsForSingleSheet(thisSheet);
  ui.alert(
    `${SERVICENAME} Message`,
    `Fixing Missing Tickets for ${thisSheet.getSheetName()} from PrinterOS Server`,
    ui.ButtonSet.OK
  );
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
  let title = `PrinterOS Controller`;
  let htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

const PopupRemoveUsersNotInBillingList = async () => {
  let ui = await SpreadsheetApp.getUi();
  await RemoveStudentsWhoDidntPrint();
  ui.alert(
    `${SERVICENAME} Billing Cleanup`,
    `All Users Who haven't printed with us REMOVED from Billing REPORT`,
    ui.ButtonSet.OK
  );
}

const PopupCalcBilling = async () => {
  let ui = await SpreadsheetApp.getUi();
  await CalculateMaterialCostForBilling();
  ui.alert(
    `${SERVICENAME} Billing`,
    `Calculated Printing Costs for ALL our Users.`,
    ui.ButtonSet.OK
  );
} 

/**
 * Builds our JPS Menu and sets functions.
 * @TRIGGERED ONOPEN
 */
const BarMenu = () => {
  SpreadsheetApp.getUi()
    .createMenu(`JPS Menu`)
    .addItem(`Barcode Scanning Tool`, `OpenBarcodeTab`)
    .addSeparator()
    .addItem(`Mark as Abandoned`, `PopUpMarkAsAbandoned`)
    .addItem(`Mark as Picked Up`, `PopUpMarkAsPickedUp`)
    .addSeparator()
    .addItem(`Count Queue`, `PopupCountQueue`)
    .addItem(`Create a Ticket for a User`, `PopupCreateTicket`)
    .addItem(`Fix All Missing Tickets`, `MissingTicketUpdater`)
    .addItem(`Fix Missing Tickets for THIS Sheet`, `PopupFixMissingTicketsForThisSheet`)
    .addItem(`Fix All Missing Filenames`, `UpdateAllFilenames`)
    .addSeparator()
    .addItem(`Recompute Metrics`, `Metrics`)
    .addItem(`Fetch All New Data`, `WriteAllNewDataToSheets`)
    .addItem(`Fetch All New Data for This Sheet`, `PopupFetchNewForSingleSheet`)
    .addItem(`Update All`, `PopupUpdate`)
    .addItem(`Remove Duplicate Info`, `PopupRemoveDuplicates`)
    .addSeparator()
    .addItem(`Generate Semester Billing`, `Billing`)
    .addItem(`Calculate Material Costs for All Users on Billing Sheet`, `PopupCalcBilling`)
    .addItem(`Export Billing Report CSV`,`SaveAsCSV`)
    .addSeparator()
    .addItem(`Help`, `PopupHelp`)
    .addToUi();
};



/**
 * Switch to scanning page.
 */
const OpenBarcodeTab = async () => {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  await spreadsheet.setActiveSheet(OTHERSHEETS.Scanner).getRange(`B3`).activate();
}


