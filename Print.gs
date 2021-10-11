/**
 * Show URL helper Function
 */
const ShowURL = () => {
  const cpService = GetCloudPrintService();
  if (!cpService.hasAccess()) {
    Logger.log(cpService.getAuthorizationUrl());
  }
}

/**
 * Get Cloud Printer Service
 */
const GetCloudPrintService = () => {
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
const AuthCallback = (request) => {
  let isAuthorized = GetCloudPrintService().handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('You can now use Google Cloud Print from Apps Script.');
  } else {
    return HtmlService.createHtmlOutput('Cloud Print Error: Access Denied');
  }
}


/**
 * Get Cloud Printer List
 */
const GetCloudPrinterList = () => {

  const response = UrlFetchApp.fetch('https://www.google.com/cloudprint/search', {
    headers: { Authorization: 'Bearer ' + GetCloudPrintService().getAccessToken() },
    muteHttpExceptions: true
  }).getContentText();

  const printers = JSON.parse(response).printers;

  printers.forEach(printer => {
    Logger.log("%s %s %s", printer.id, printer.name, printer.description);
  });
}


/**
 * Print a Google Doc
 */
const PrintGoogleDocument = async (docID, printerID, docName) => {
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
    headers: { Authorization: 'Bearer ' + GetCloudPrintService().getAccessToken() },
    "muteHttpExceptions": true
  }
  const res = await UrlFetchApp(repo, params);
  const response = JSON.parse(res);

  if (response.success) {
    Logger.log(`Success : ${response.message}`);
  } else {
    Logger.log("Error Code: %s %s", response.errorCode, response.message);
  }
}



