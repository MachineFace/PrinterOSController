



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Creates a pop-up for counting users.
 */
const PopupCountQueue = async () => {
  let ui = await SpreadsheetApp.getUi();
  let count = await CountQueue();
  ui.alert(
    `JPS Runtime Message`,
    `Prints Currently in Queue : ${count}`,
    ui.ButtonSet.OK
  );
};

/**
 * Count the Number of Jobs in the Queue.
 */
const CountQueue = () => {
  let count = 0;
  for(const [key, sheet] of Object.entries(SHEETS)) {
    let pageCount = sheet.createTextFinder("Queued").findAll().length;
    count = count + pageCount;
  }
  Logger.log(`Count : ${count}`);
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
  if (sheetname == "Staff List" || sheetname == "Data/Metrics" || sheetname == "Pickup Scanner") {
    Browser.msgBox(
      "Incorrect Sheet Active",
      "Please select from the correct sheet. Select one cell in the row and a ticket will be created.",
      Browser.Buttons.OK
    );
    return;
  }

  // Loop through to get last row and set status to received
  const printerID = thisSheet.getRange(thisRow, 2).getValue();
  const printerName = thisSheet.getRange(thisRow, 3).getValue();
  const jobID = thisSheet.getRange(thisRow, 4).getValue();
  const timestamp = thisSheet.getRange(thisRow, 5).getValue();
  const email = thisSheet.getRange(thisRow, 6).getValue();
  const status = thisSheet.getRange(thisRow, 7).getValue();
  const duration = thisSheet.getRange(thisRow, 8).getValue();
  const elapsed = thisSheet.getRange(thisRow, 10).getValue();
  const materials = thisSheet.getRange(thisRow, 11).getValue();
  const cost = thisSheet.getRange(thisRow, 12).getValue();
  const filename = thisSheet.getRange(thisRow, 15).getValue();
  const png = thisSheet.getRange(thisRow, 13).getValue();
  
  const imageBlob = await GetImage(png);
  
  try {
    const ticket = await new Ticket({
      name : email,
      submissionTime : timestamp,
      email : email,
      printerName : printerName,
      printerID : printerID,
      printDuration : duration,
      material1Quantity : materials,
      jobID : jobID,
      filename : filename,
      image : imageBlob,
    }).CreateTicket();
    const url = ticket.getUrl();
    thisSheet.getRange(thisRow, 14).setValue(url.toString());
  } catch (err) {
    Logger.log(`${err} : Couldn't create a ticket.`);
  }

  ui.alert(
    `JPS Runtime Message`,
    `Ticket Created for : ${email}, @ Index : ${thisRow}, Job Number : ${jobID}`,
    ui.ButtonSet.OK
  );
};


/**
 * Builds HTML file for the modal pop-up from the help list.
 */
const BuildHTMLHELP = () => {
  let items = Help();
  let html = '<h2 style="text-align:center"><b> HELP MENU </b></h2>';
  html += '<h3 style="font-family:Roboto">How to Use JPS : </h3>';
  html += "<hr>";
  html += "<p>" + items[0] + "</p>";
  html += '<ol style="font-family:Roboto font-size:10">';
  items.forEach((item, index) => {
    if (index > 0 && index < items.length - 1) {
      html += "<li>" + item + "</li>";
    }
  });
  html += "</ol>";
  html += "<p>" + items[items.length - 1] + "</p>";

  Logger.log(html);
  return html;
};

/**
 * Creates a modal pop-up for the help text.
 */
const PopupHelp = () => {
  let ui = SpreadsheetApp.getUi();
  let title = "JPS Runtime HELP";
  let htmlOutput = HtmlService.createHtmlOutput(BuildHTMLHELP())
    .setWidth(640)
    .setHeight(480);
  ui.showModalDialog(htmlOutput, title);
};

const PopupUpdate = async () => {
  let ui = await SpreadsheetApp.getUi();
  UpdateAll();
  ui.alert(
    `JPS Runtime Message`,
    `All Info Updated from PrinterOS Server`,
    ui.ButtonSet.OK
  );
};

const PopupRemoveDuplicates = async () => {
  let ui = await SpreadsheetApp.getUi();
  TriggerRemoveDuplicates();
  ui.alert(
    `JPS Runtime Message`,
    `All Duplicate Info from PrinterOS Server removed.`,
    ui.ButtonSet.OK
  );
};

/**
 * Builds our JPS Menu and sets functions.
 */
const BarMenu = () => {
  SpreadsheetApp.getUi()
    .createMenu("JPS Menu")
    .addItem("Barcode Scanning Tool", "OpenBarcodeTab")
    .addSeparator()
    .addItem("Count Queue", "PopupCountQueue")
    .addItem(`Create a Ticket for a User`, `PopupCreateTicket`)
    .addItem(`Fix All Missing Tickets`, `FixMissingTickets`)
    .addItem(`Fix All Missing Filenames`, `UpdateAllFilenames`)
    .addSeparator()
    .addItem("Help", "PopupHelp")
    .addSeparator()
    .addItem(`Recompute Metrics`, `Metrics`)
    .addItem(`Fetch All New Data`, `WriteAllNewDataToSheets`)
    .addItem(`Update All`, `PopupUpdate`)
    .addItem(`Remove Duplicate Info`, `PopupRemoveDuplicates`)
    .addToUi();
};



/**
 * Switch to scanning page.
 */
const OpenBarcodeTab = async () => {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  await spreadsheet.setActiveSheet(OTHERSHEETS.Scanner).getRange('B3').activate();
}


