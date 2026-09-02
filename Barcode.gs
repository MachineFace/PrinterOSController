
/**
 * For use with barcode scanner.
 * Searches for job number found in cell B2 of SearchByBarCode sheet and changes status to 'Picked Up'
 */
const PickupByBarcode = () => {
  const ui = SpreadsheetApp.getUi();
  const jobnumber = OTHERSHEETS.Scanner.getRange(3,2).getValue();
  let progressUpdate = OTHERSHEETS.Scanner.getRange(4,2);
  progressUpdate.setValue(`Searching for Print #${jobnumber}.......`);
  if (jobnumber == null || jobnumber == "" || jobnumber instanceof String) {
    progressUpdate.setValue(`No Print Number provided! Select the yellow cell, scan, then press enter to make sure the cell's value has been changed.`);
    ui.alert(
      `${SERVICE_NAME}`,
      `Jobnumber : ${jobnumber} was goofy. Please fix and try again...`,
      ui.ButtonSet.OK
    );
    return;
  }

  // loop through sheets to look for value
  for (const [key, sheet] of Object.entries(SHEETS)) {

    const textFinder = sheet.createTextFinder(jobnumber);
    const searchFind = textFinder.findNext();
    if (searchFind != null) {
      searchRow = searchFind.getRow();
      SheetService.SetByHeader(sheet, HEADERNAMES.status, searchRow, STATUS.pickedUp.plaintext); // change status to picked up
      progressUpdate.setValue(`Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`);
      console.info(`Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`);
      ui.alert(
        `${SERVICE_NAME}`,
        `Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`,
        ui.ButtonSet.OK
      );
      return;
    } 
  }
  progressUpdate.setValue('Print Number not found. Try again.');
  ui.alert(
    `${SERVICE_NAME}`,
    `Print #${jobnumber} not found.. Please try again....`,
    ui.ButtonSet.OK
  );
} 


/**
 * Mark a job as abandoned and send an email to that student
 */
const MarkAsAbandonedByBarcode = async () => {
  try {
    const ui = SpreadsheetApp.getUi();
    const jobnumber = OTHERSHEETS.Scanner.getRange(3,2).getValue();
    let progressUpdate = OTHERSHEETS.Scanner.getRange(4,2);
    progressUpdate.setValue(`Searching for job number...`);
    let res = {}
    if (!jobnumber || jobnumber instanceof String) {
      progressUpdate.setValue(`No job number provided. Select the yellow cell, scan, then press enter to make sure the cell's value has been changed.`);
      ui.alert(
        `${SERVICE_NAME}`,
        `Jobnumber : ${jobnumber} was goofy. Please fix and try again...`,
        ui.ButtonSet.OK
      );
      return;
    } 
    res = SheetService.FindOne(jobnumber);
    console.info(res)
    if(Object.keys(res).length === 0) {
      progressUpdate.setValue(`Job number not found. Try again.`);
      ui.alert(
        `${SERVICE_NAME}`,
        `Jobnumber : ${jobnumber} not found...`,
        ui.ButtonSet.OK
      );
      return 0;
    } 

    let sheet = SHEETS[res.sheetName];
    let row = res.row;
    let email = res.email;
    let projectname = res.filename;
    let weight = res.weight;
    SheetService.SetByHeader(sheet, HEADERNAMES.status, row, STATUS.abandoned.plaintext);
    progressUpdate.setValue(`Job number ${jobnumber} marked as abandoned. Sheet: ${sheet.getSheetName()} row: ${row}`);
    console.info(`Job number ${jobnumber} marked as abandoned. Sheet: ${sheet.getSheetName()} row: ${row}`);

    progressUpdate.setValue(`Emailing ${email}......`);
    await new EmailService({
      email : email, 
      status : STATUS.abandoned.plaintext,
      projectname : projectname,
      jobnumber : jobnumber,
      weight : weight,
    })
    progressUpdate.setValue(`Owner ${email} of abandoned job: ${jobnumber} emailed..`);
    ui.alert(
      `${SERVICE_NAME}`,
      `Owner ${email} of abandoned job: ${jobnumber} emailed..`,
      ui.ButtonSet.OK
    );
    return;
  } catch(err) {
    console.error(`"MarkAsAbandonedByBarcode()" failed: ${err}`);
    return null;
  }
  
}








