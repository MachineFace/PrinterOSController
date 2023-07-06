


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a QR code from some data. Feed it a url.
 * @param {string} url
 * @pararm {string} jobnumber
 * @return
 */
class BarcodeService {
  constructor({
    jobnumber : jobnumber = Math.floor(Math.random() * 100000).toFixed(),
  }) {
    /** @private */
    this.jobnumber = jobnumber;
  }

  /**
   * Generate Barcode
   */
  async GenerateBarcode() {
    const root = 'http://bwipjs-api.metafloor.com/';
    const rootsec = 'https://bwipjs-api.metafloor.com/';
    const type = '?bcid=code128';
    const ts = '&text=';
    const scale = '&scale=0.75'
    const postfx = '&includetext';

    //let url = 'http://bwipjs-api.metafloor.com/?bcid=code128&text=1234567890&includetext';  //KNOWN WORKING LOCATION
    const url = root + type + ts + this.jobnumber + scale + postfx;

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
      const blob = Utilities.newBlob(content).setName(`Barcode : ${this.jobnumber}`) ;
      
      let barcode = DriveApp.createFile(blob);
      barcode.setTrashed(true);
      
      console.info(`BARCODE CREATED ---> ${barcode?.getUrl()}`);
      return barcode;
    } catch(err) {
      console.error(`"GenerateBarcode()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Generate Barcode (Formatted)
   */
  GenerateBarCodeForTicketHeader() {

    const root = 'http://bwipjs-api.metafloor.com/';
    const type = '?bcid=code128';
    const ts = '&text=';
    const scaleX = `&scaleX=6`
    const scaleY = '&scaleY=6';
    const postfx = '&includetext';

    const url = root + type + ts + this.jobnumber + scaleX + scaleY + postfx;

    const params = {
      method : "GET",
      headers : { "Authorization": "Basic ", "Content-Type" : "image/png" },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };
    
    try {
      const response = UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContent();

      let barcode = DriveApp.createFile( Utilities.newBlob(content).setName(`Barcode : ${this.jobnumber}`) );
      barcode.setTrashed(true);
       
      console.info(`BARCODE CREATED ---> ${barcode?.getUrl()}`);
      return barcode;
    } catch(err) {
      console.error(`"GenerateBarCodeForTicketHeader()" failed : ${err}`);
      return 1;
    }
  }
  
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a QR code from some data. Feed it a url.
 * https://goqr.me/api/doc/create-qr-code/
 * @param {string} url
 * @pararm {string} jobnumber
 * @return
 */
class QRCodeService {
  constructor({
    filename : filename = `file`,
    url : url = 'jps.jacobshall.org/',
    size : size = `80x80`, // MAX: 1000x1000
  }) {
    /** @private */
    this.filename = filename;
    /** @private */
    this.size = size;
    this.url = url;
  }

  /**
   * Generate QR Code
   * return {blob} QR Code
   */
  async GenerateQRCode(){
    const filename = this.filename = `file` ? Math.floor(Math.random() * 100000).toFixed() : this.filename;
    // console.info(`URL : ${this.url}`);
    const loc = `https://api.qrserver.com/v1/create-qr-code/?size=${this.size}&data=${this.url}`;  //API call
    const postParams = {
      method : "GET",
      headers : { "Authorization" : "Basic" },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true
    };

    try {
      const response = await UrlFetchApp.fetch(loc, postParams);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContent();
      const blob = Utilities.newBlob(content).setName(`QRCode ${filename}`);
      let qrCode = await DriveApp.getFolderById(TICKETGID).createFile(blob);

      console.info(`QRCODE CREATED ---> ${qrCode?.getUrl().toString()}`);
      return qrCode;
    } catch(err) {
      console.error(`"GenerateQRCode()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Create Printable QR Code
   * @return {doc} printable doc
   */
  async CreatePrintableQRCode() {
    const filename = this.filename = `file` ? `QRCode-${Number(Math.floor(Math.random() * 100000)).toFixed()}` : this.filename;
    const folder = DriveApp.getFolderById(TICKETGID);
    let doc = DocumentApp.create(filename); // Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    
    const qr = await this.GenerateQRCode();

    // Append Document with Info
    if (doc != undefined || doc != null || doc != NaN) {
      body
        .setPageWidth(PAGESIZES.letter.width)
        .setPageHeight(PAGESIZES.letter.height)
        .setMarginTop(2)
        .setMarginBottom(2)
        .setMarginLeft(2)
        .setMarginRight(2);

      body.insertImage(0, qr)
        .setWidth(PAGESIZES.letter.width - 50)
        .setHeight(PAGESIZES.letter.width - 50);      

      // Remove File from root and Add that file to a specific folder
      try {
        const docFile = DriveApp.getFileById(docId);
        docFile.moveTo(folder);
        docFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
      } catch (err) {
        console.error(`Whoops : ${err}`);
      }
      
    }
    // Return Document to use later
    console.info(`DOC ----> ${doc?.getUrl()?.toString()}`)
    return await doc;
  };

  /**
   * Generate QR Code
   * @return {object} QR Code
   */
  async GenerateQRCodeBasic(){
    try {
      const filename = this.filename = `file` ? Math.floor(Math.random() * 100000).toFixed() : this.filename;
      const loc = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${this.url}`;  // API call
      const postParams = {
        method : "GET",
        headers : { "Authorization" : "Basic" },
        contentType : "application/json",
        followRedirects : true,
        muteHttpExceptions : true
      };

      const response = await UrlFetchApp.fetch(loc, postParams);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const blob =  Utilities.newBlob(response.getContent()).setName(`QRCode-${filename}`);

      let qrCode = DriveApp.createFile(blob);
      qrCode.setTrashed(true);
    
      console.info(`QRCode Created ---> ${qrCode?.getUrl()?.toString()}`);
      return qrCode;
    } catch(err) {
      console.error(`"GenerateQRCode()" failed : ${err}`);
      return 1;
    }
  }

}




/**
 * -----------------------------------------------------------------------------------------------------------------
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
      `${SERVICENAME}`,
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
      SetByHeader(sheet, HEADERNAMES.status, searchRow, STATUS.pickedUp.plaintext); // change status to picked up
      progressUpdate.setValue(`Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`);
      console.info(`Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`);
      ui.alert(
        `${SERVICENAME}`,
        `Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`,
        ui.ButtonSet.OK
      );
      return;
    } 
  }
  progressUpdate.setValue('Print Number not found. Try again.');
  ui.alert(
    `${SERVICENAME}`,
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
      `${SERVICENAME}`,
      `Jobnumber : ${jobnumber} was goofy. Please fix and try again...`,
      ui.ButtonSet.OK
    );
    return;
  } 
  res = FindOne(jobnumber);
  console.info(res)
  if(Object.keys(res).length === 0) {
    progressUpdate.setValue(`Job number not found. Try again.`);
    ui.alert(
      `${SERVICENAME}`,
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
  SetByHeader(sheet, HEADERNAMES.status, row, STATUS.abandoned.plaintext);
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
    `${SERVICENAME}`,
    `Owner ${email} of abandoned job: ${jobnumber} emailed..`,
    ui.ButtonSet.OK
  );
  return;
  
}








