



/**
 * -----------------------------------------------------------------------------------------------------------------
 * For use with barcode scanner.
 * Searches for job number found in cell B2 of SearchByBarCode sheet and changes status to 'Picked Up'
 */
const PickupByBarcode = () => {
  const jobnumber = OTHERSHEETS.Scanner.getRange(3,2).getValue();
  let progress = OTHERSHEETS.Scanner.getRange(4,2);
  progress.setValue(`Searching for Print #${jobnumber}.......`);
  if (jobnumber == null || jobnumber == "") {
    progress.setValue(`No Print Number provided! Select the yellow cell, scan, then press enter to make sure the cell's value has been changed.`);
    return;
  }

  // loop through sheets to look for value
  for (const [key, sheet] of Object.entries(SHEETS)) {

    const textFinder = sheet.createTextFinder(jobnumber);
    const searchFind = textFinder.findNext();
    if (searchFind != null) {
      searchRow = searchFind.getRow();
      
      // change status to picked up
      sheet.getRange(searchRow, 1, 1, 1).setValue(STATUS.pickedUp);
      progress.setValue(`Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`);
      console.info(`Print #${jobnumber} marked as "Picked-up". Printer: ${key}, Row: ${searchRow}`);
      return;
    }
  }
  progress.setValue('Print Number not found. Try again.');
} 


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a QR code from some data. Feed it a url.
 * @param {string} url
 * @pararm {string} jobnumber
 * @return
 */
class QRCodeAndBarcodeGenerator {
  constructor(
    {
      url = 'jps.jacobshall.org/', 
      jobnumber = Math.floor(Math.random() * 100000).toFixed(),
    }) {
    this.url = url;
    this.jobnumber = jobnumber;
  }

  GenerateQRCode(){
    console.info(`URL : ${this.url}, Jobnumber : ${this.jobnumber}`);
    const loc = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${this.url}`;  //API call
    const postParams = {
        "method" : "GET",
        "headers" : { "Authorization" : "Basic" },
        "contentType" : "application/json",
        followRedirects : true,
        muteHttpExceptions : true
    };

    let qrCode;
    const html = UrlFetchApp.fetch(loc, postParams);
    console.info(`Response Code : ${html.getResponseCode()}`);
    if (html.getResponseCode() == 200) {
        qrCode = DriveApp.createFile( Utilities.newBlob(html.getContent()).setName('QRCode' + this.jobnumber ) );
        qrCode.setTrashed(true);
    }
    else console.error('Failed to GET QRCode');

    console.info(qrCode);
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
    console.info("Response Code : " + html.getResponseCode());
    if (html.getResponseCode() == 200) {
      barcode = DriveApp.createFile( Utilities.newBlob(html.getContent()).setName(`Barcode : ${this.jobnumber}`) );
      barcode.setTrashed(true);
    } 
    else console.error('Failed to GET Barcode');
    console.info(barcode);
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
    console.info(`Response Code : ${responseCode}, ${RESPONSECODES[responseCode]}`);
    if (responseCode == 200) {
      barcode = DriveApp.createFile( Utilities.newBlob(res.getContent()).setName(`Barcode : ${this.jobnumber}`) );
      barcode.setTrashed(true);
    } 
    else console.error('Failed to GET Barcode');
    console.info(barcode);
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
  constructor(
    {
      url = 'jps.jacobshall.org/',
      size = `80x80`, // MAX: 1000x1000
    }) {
    this.url = url;
    this.size = size;
  }

  async GenerateQRCode(){
    const randName = Math.floor(Math.random() * 100000).toFixed();
    console.info(`URL : ${this.url}`);
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
    console.info(`Response Code : ${RESPONSECODES[html.getResponseCode()]}`);
    if (html.getResponseCode() == 200) {
      qrCode = DriveApp.createFile( Utilities.newBlob(html.getContent()).setName(`QRCode ${randName}`) );
      qrCode.setTrashed(true);
    }
    else console.error(`Failed to GET QRCode`);

    console.info(qrCode);
    return await qrCode;
  }

  async CreatePrintableDoc() {
    const folder = DriveApp.getFoldersByName(`Job Tickets`); // Set the correct folder
    const doc = DocumentApp.create('QRCode'); // Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    let url = doc.getUrl();

    const qr = new this.GenerateQRCode();

    // Append Document with Info
    if (doc != undefined || doc != null || doc != NaN) {
      let header = doc
        .addHeader()
        .appendTable([[`img1`]])
        .setAttributes({
          [DocumentApp.Attribute.BORDER_WIDTH]: 0,
          [DocumentApp.Attribute.BORDER_COLOR]: `#ffffff`,
        });
      this.ReplaceTextToImage(header, `img1`, qr);

      // Remove File from root and Add that file to a specific folder
      try {
        const docFile = DriveApp.getFileById(docId);
        DriveApp.removeFile(docFile);
        folder.next().addFile(docFile);
        folder.next().addFile(barcode);
      } catch (err) {
        console.error(`Whoops : ${err}`);
      }


      // Set permissions to 'anyone can edit' for that file
      let file = DriveApp.getFileById(docId);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
    }
    //Return Document to use later
    console.info(JSON.stringify(doc))
    return doc;
  };

}


const _testPrint = () => {
  const data = {url : `https://bcourses.berkeley.edu/courses/1353091/pages/woodshop`, size : `1000x1000`};
  const doc = new OpenQRGenerator(data).CreatePrintableDoc();
  console.info(doc);
}

