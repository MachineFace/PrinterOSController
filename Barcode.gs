


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a QR code from some data. Feed it a url.
 * @param {string} url
 * @pararm {string} jobnumber
 * @return
 */
class BarcodeService {
  constructor() {

  }

  /**
   * Generate Barcode
   * @param {number} number to encode
   * @return {barcode} barcode
   */
  static async GenerateBarcode(jobID = Math.floor(Math.random() * 100000).toFixed()) {
    const root = 'http://bwipjs-api.metafloor.com/';
    // const rootsec = 'https://bwipjs-api.metafloor.com/';
    const scale = '&scale=0.75'
    const postfx = '&includetext';

    //let url = 'http://bwipjs-api.metafloor.com/?bcid=code128&text=1234567890&includetext';  //KNOWN WORKING LOCATION
    const url = root + `?bcid=code128` + `&text=` + jobID + scale + postfx;

    const params = {
      method : "GET",
      headers : { "Authorization" : "Basic ", "Content-Type" : "image/png" },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };

    try {
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`);  
      const content = response.getContent();
      const blob = Utilities.newBlob(content).setName(`Barcode_${jobID}`) ;
      const barcode = DriveApp.createFile(blob);      
      console.info(`BARCODE CREATED ---> ${barcode?.getUrl()}`);
      barcode.setTrashed(true);
      return blob;
    } catch(err) {
      console.error(`"GenerateBarcode()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Generate Barcode (Formatted)
   * @param {number} number to encode
   * @return {barcode} barcode   
   */
  static async GenerateBarCodeForTicketHeader(jobID = Math.floor(Math.random() * 100000).toFixed()) {
    const root = 'http://bwipjs-api.metafloor.com/';
    const scaleX = `&scaleX=6`
    const scaleY = '&scaleY=6';
    const postfx = '&includetext';

    const url = root + `?bcid=code128` + `&text=` + jobID + scaleX + scaleY + postfx;

    const params = {
      method : "GET",
      headers : { "Authorization": "Basic ", "Content-Type" : "image/png" },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };
    
    try {
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContent();
      const blob = Utilities.newBlob(content).setName(`Barcode_${jobID}`);
      const barcode = DriveApp.createFile(blob);       
      console.info(`BARCODE CREATED ---> ${barcode?.getUrl()}`);
      barcode.setTrashed(true);
      return blob;
    } catch(err) {
      console.error(`"GenerateBarCodeForTicketHeader()" failed : ${err}`);
      return 1;
    }
  }
  
}







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
  const ui = SpreadsheetApp.getUi();
  const jobnumber = OTHERSHEETS.Scanner.getRange(3,2).getValue();
  let progressUpdate = OTHERSHEETS.Scanner.getRange(4,2);
  progressUpdate.setValue(`Searching for job number...`);
  let res = {};
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
  await new Emailer({
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
  
}








