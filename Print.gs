/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for interfacing with Physical Printers
 */
class NetworkPrinter
{
  constructor(){
    this.googleID = "576527286089-l5pr801cmggb0hisn5kcisanbsiv14ul.apps.googleusercontent.com";
    this.google_secret = "6X5vHouCqFT6GeiPp3Cjmr93";
    this.service = this.GetCloudPrintService();
  }

  /**
   * Show URL
   */
  ShowURL() {
    const cpService = this.service;
    if (!cpService.hasAccess()) {
      console.info(cpService.getAuthorizationUrl());
    }
  }

  /**
   * Get Cloud Printer Service
   */
  GetCloudPrintService() {
    return OAuth2.createService('print')
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setClientId(this.googleID)
      .setClientSecret(this.google_secret)
      .setCallbackFunction('AuthCallback')
      .setPropertyStore(PropertiesService.getUserProperties())
      .setScope('https://www.googleapis.com/auth/cloudprint')
      .setParam('login_hint', Session.getActiveUser().getEmail())
      .setParam('access_type', 'offline')
      .setParam('approval_prompt', 'force');
  }

  /**
   * Auth Callback Function
   */
  AuthCallback (request) {
    const isAuthorized = this.service.handleCallback(request);
    if (isAuthorized) return HtmlService.createHtmlOutput('You can now use Google Cloud Print from Apps Script.');
    else return HtmlService.createHtmlOutput('Cloud Print Error: Access Denied');
  }

  /**
   * Get Cloud Printer List
   */
  async GetCloudPrinterList() {
    const repo = 'https://www.google.com/cloudprint/search';
    const params = {
      headers: { Authorization: 'Bearer ' + this.service.getAccessToken() },
      muteHttpExceptions: true
    }
    const html = await UrlFetchApp.fetch(repo, params);
    const responseCode = html.getResponseCode();
    console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const printers = JSON.parse(html.getContentText()).printers;
      console.info(printers);  
      printers.forEach(printer => {
        console.info(`Printer : ${printer.id}, Name : ${printer.name}, Description : ${printer.description}`);
      });
    } else {
      console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    }
  }

  /**
   * Print a Google Doc
   */
  async PrintGoogleDocument(docID, printerID, docName) {
    const repo = 'https://www.google.com/cloudprint/submit';

    let printTicket = {
      version: "1.0",
      print: {
        color: {
          type: "STANDARD_COLOR",
          vendor_id: "Color"
        },
        duplex: {
          type: "NO_DUPLEX"
        }
      }
    };

    let payload = {
      "printerid" : printerID,
      "title"     : docName,
      "content"   : DriveApp.getFileById(docID).getBlob(),
      "contentType": "application/pdf",
      "ticket"    : JSON.stringify(printTicket)
    };

    const params = {
      method: "POST",
      payload: payload,
      headers: { Authorization: 'Bearer ' + this.service.getAccessToken() },
      "muteHttpExceptions": true
    }
    const res = await UrlFetchApp(repo, params);
    const response = JSON.parse(res);

    if (response.success) console.info(`Success : ${response.message}`);
    else console.error(`Error Code : ${response.errorCode}, Message : ${response.message}`);
  }

}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Printer Class
 */
const _testNet = () => {
  const p = new NetworkPrinter();
  // p.ShowURL();
  p.GetCloudPrinterList();
}

const DownloadFile = (id) => {
  const file = DriveApp.getFileById(id);
  const name = file.getName();
  const content = file.getAs('application/pdf').getDataAsString();
    
  const output = ContentService
    .createTextOutput()
    .setMimeType(ContentService.MimeType.CSV)
    .setContent(content)
    .downloadAsFile(name)

  file.setTrashed(true);
  return output;
}


const _testPrinters = () => {
  const s = Search(STATUS.inProgress)
  for(const [sheetname, indexes] of Object.entries(s)) {
    console.info(sheetname)
    indexes.forEach(index => {
      const ticketURL = SpreadsheetApp.getActive().getSheetByName(sheetname).getRange( index, 14, 1, 1 ).getValue();
      const file = DocumentApp.openByUrl(ticketURL).
      console.info(file)
    })
  }
}


const _testa = () => {
  // Test on random ticket
  const random = Math.floor(Math.random() * (200 - 2) + 2);
  const ticket = SHEETS.Spectrum.getRange(random, 14, 1, 1).getValue();
  const doc = DocumentApp.openByUrl(ticket)
  const id = doc.getId()
  let d = DownloadFile(id)
  console.info(d)
  // return ContentService.createTextOutput(fileString).downloadAsFile(fileName);
}









