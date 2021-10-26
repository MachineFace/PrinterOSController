class NetworkPrinter
{
  constructor(){
    this.service = this.GetCloudPrintService();
  }

  /**
   * Show URL
   */
  ShowURL() {
    const cpService = this.service;
    if (!cpService.hasAccess()) {
      Logger.log(cpService.getAuthorizationUrl());
    }
  }

  /**
   * Get Cloud Printer Service
   */
  GetCloudPrintService() {
    return OAuth2.createService('print')
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setClientId('CLIENT_ID')
      .setClientSecret('CLIENT_SECRET')
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
    const response = await UrlFetchApp.fetch(repo, params).getContentText();
    const printers = JSON.parse(response).printers;

    printers.forEach(printer => {
      Logger.log(`Printer : ${printer.id}, Name : ${printer.name}, Description : ${printer.description}`);
    });
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

    if (response.success) Logger.log(`Success : ${response.message}`);
    else Logger.log(`Error Code : ${response.errorCode}, Message : ${response.message}`);
  }

}

const _testNet = () => {
  const p = new NetworkPrinter();
  p.ShowURL();
  p.GetCloudPrinterList();
}













