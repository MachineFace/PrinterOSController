/**
 * -----------------------------------------------------------------------------------------------------------------
 * Generate a QR code from some data. Feed it a url.
 * https://goqr.me/api/doc/create-qr-code/
 * @param {string} url
 * @pararm {string} jobnumber
 * @return
 * @NOTIMPLEMENTED
 */
class QRCodeService {
  constructor({
    filename : filename = `file`,
    url : url = 'jps.jacobshall.org/',
    size : size = `80x80`, // MAX: 1000x1000
  }) {
    /** @private */
    this.gid = PropertiesService.getScriptProperties().getProperty(`TICKETGID`);
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
    try {
      const filename = this.filename = `file` ? Math.floor(Math.random() * 100000).toFixed() : this.filename;
      // console.info(`URL : ${this.url}`);
      const loc = `https://api.qrserver.com/v1/create-qr-code/?size=${this.size}&data=${this.url}`;  //API call
      const postParams = {
        'method' : "GET",
        'headers' : { "Authorization" : "Basic" },
        'contentType' : "application/json",
        'followRedirects' : true,
        'muteHttpExceptions' : true
      }

      const response = await UrlFetchApp.fetch(loc, postParams);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContent();
      const blob = Utilities.newBlob(content).setName(`QRCode ${filename}`);
      let qrCode = await DriveApp.getFolderById(this.gid).createFile(blob);

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
    const filename = this.filename = `file` ? `QRCode-${IDService.createId()}` : this.filename;
    const folder = DriveApp.getFolderById(this.gid);
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
  }

  /**
   * Generate QR Code
   * @return {object} QR Code
   */
  async GenerateQRCodeBasic(){
    try {
      const filename = this.filename = `file` ? `QRCode-${IDService.createId()}` : this.filename;
      const loc = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${this.url}`;  // API call
      const postParams = {
        'method' : "GET",
        'headers' : { "Authorization" : "Basic" },
        'contentType' : "application/json",
        'followRedirects' : true,
        'muteHttpExceptions' : true
      }

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