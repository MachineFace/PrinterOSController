



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
      `PrinterOS`,
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
        `PrinterOS`,
        `Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`,
        ui.ButtonSet.OK
      );
      return;
    } 
  }
  progressUpdate.setValue('Print Number not found. Try again.');
  ui.alert(
    `PrinterOS`,
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
      `PrinterOS`,
      `Jobnumber : ${jobnumber} was goofy. Please fix and try again...`,
      ui.ButtonSet.OK
    );
    return;
  } else {
    res = FindOne(jobnumber);
    console.info(res)
    if(Object.keys(res).length === 0) {
      progressUpdate.setValue(`Job number not found. Try again.`);
      ui.alert(
        `PrinterOS`,
        `Jobnumber : ${jobnumber} not found...`,
        ui.ButtonSet.OK
      );
    } else {
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
        `PrinterOS`,
        `Owner ${email} of abandoned job: ${jobnumber} emailed..`,
        ui.ButtonSet.OK
      );
      return;
  }

  }

    
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a QR code from some data. Feed it a url.
 * @param {string} url
 * @pararm {string} jobnumber
 * @return
 */
class QRCodeAndBarcodeGenerator {
  constructor({
    url : url = 'jps.jacobshall.org/', 
    jobnumber : jobnumber = Math.floor(Math.random() * 100000).toFixed(),
  }) {
    this.url = url;
    this.jobnumber = jobnumber;
  }

  GenerateQRCode(){
    console.info(`URL : ${this.url}, Jobnumber : ${this.jobnumber}`);
    const loc = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${this.url}`;  // API call
    const postParams = {
      "method" : "GET",
      "headers" : { "Authorization" : "Basic" },
      "contentType" : "application/json",
      followRedirects : true,
      muteHttpExceptions : true
    };

    let qrCode;
    const html = UrlFetchApp.fetch(loc, postParams);
    // console.info(`Response Code : ${html.getResponseCode()}`);
    if (html.getResponseCode() != 200) {
      console.error('Failed to GET QRCode');
      return false; 
    }
    qrCode = DriveApp.createFile( Utilities.newBlob(html.getContent()).setName(`QRCode${this.jobnumber}`));
    qrCode.setTrashed(true);
  
    console.info(`QRCode Created ---> ${qrCode?.getId()?.toString()}`);
    return qrCode;
  }

  GenerateBarCode() {

    const root = 'http://bwipjs-api.metafloor.com/';
    const rootsec = 'https://bwipjs-api.metafloor.com/';
    const type = '?bcid=code128';
    const ts = '&text=';
    const scale = '&scale=0.75'
    const postfx = '&includetext';

    //let barcodeLoc = 'http://bwipjs-api.metafloor.com/?bcid=code128&text=1234567890&includetext';  //KNOWN WORKING LOCATION
    const barcodeLoc = root + type + ts + this.jobnumber + scale +postfx;

    const params = {
        "method" : "GET",
        "headers" : { "Authorization": "Basic ", "Content-Type" : "image/png" },
        "contentType" : "application/json",
        followRedirects : true,
        muteHttpExceptions : true
    };
    
    let barcode;
    let html = UrlFetchApp.fetch(barcodeLoc, params);
    // console.info("Response Code : " + html.getResponseCode());
    if (html.getResponseCode() == 200) {
      barcode = DriveApp.createFile( Utilities.newBlob(html.getContent()).setName(`Barcode : ${this.jobnumber}`) );
      barcode.setTrashed(true);
    } 
    else console.error('Failed to GET Barcode');
    console.info(`BARCODE CREATED ---> ${barcode?.getId()?.toString()}`);
    return barcode;
  }

  GenerateBarCodeForTicketHeader() {

    const root = 'http://bwipjs-api.metafloor.com/';
    const type = '?bcid=code128';
    const ts = '&text=';
    const scaleX = `&scaleX=6`
    const scaleY = '&scaleY=6';
    const postfx = '&includetext';

    const barcodeLoc = root + type + ts + this.jobnumber + scaleX + scaleY + postfx;

    const params = {
      "method" : "GET",
      "headers" : { "Authorization": "Basic ", "Content-Type" : "image/png" },
      "contentType" : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };
    
    let barcode;
    const res = UrlFetchApp.fetch(barcodeLoc, params);
    const responseCode = res.getResponseCode();
    // console.info(`Response Code : ${responseCode}, ${RESPONSECODES[responseCode]}`);
    if (responseCode == 200) {
      barcode = DriveApp.createFile( Utilities.newBlob(res.getContent()).setName(`Barcode : ${this.jobnumber}`) );
      barcode.setTrashed(true);
    } 
    else console.error('Failed to GET Barcode');
    console.info(`BARCODE CREATED ---> ${barcode?.getId()?.toString()}`);
    return barcode;
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
class OpenQRGenerator {
  constructor({
    filename : filename = `file`,
    url : url = 'jps.jacobshall.org/',
    size : size = `80x80`, // MAX: 1000x1000
  }) {
    this.filename = filename ? filename : `file`,
    this.url = url;
    this.size = size;

  }

  async GenerateQRCode(){
    const filename = this.filename = `file` ? Math.floor(Math.random() * 100000).toFixed() : this.filename;
    // console.info(`URL : ${this.url}`);
    const loc = `https://api.qrserver.com/v1/create-qr-code/?size=${this.size}&data=${this.url}`;  //API call
    const postParams = {
      "method" : "GET",
      "headers" : { "Authorization" : "Basic" },
      "contentType" : "application/json",
      followRedirects : true,
      muteHttpExceptions : true
    };

    let qrCode;
    const html = UrlFetchApp.fetch(loc, postParams);
    // console.info(`Response Code : ${RESPONSECODES[html.getResponseCode()]}`);
    if (html.getResponseCode() != 200) {
      console.error(`Failed to GET QRCode`);
      return false; 
    }
    const blob = Utilities.newBlob(html.getContent()).setName(`QRCode ${filename}`);
    qrCode = await DriveApp.getFolderById(TICKETGID).createFile(blob)
    console.info(`QRCODE CREATED ---> ${qrCode?.getUrl().toString()}`);
    return qrCode;
  }

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

}


const _testPrint = async () => {
  const data = {url : `https://docs.google.com/forms/d/e/1FAIpQLSfLTLKre-6ZPU0qsxTkbvmfqm56p_Y_ajoRD1tKALLMvPfdMQ/viewform`, size : `1000x1000`};
  const doc = await new OpenQRGenerator(data).CreatePrintableQRCode();
}

