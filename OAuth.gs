/***
 * NOT IMPLEMENETED!!
 */


/**
 * Configure the service
 * @return {service} service
 */
const PrinterOS_Service = () => {
  try {
    const clientId = PropertiesService.getScriptProperties().getProperty(`POS_username`);
    const clientPassword = PropertiesService.getScriptProperties().getProperty(`POS_password`);
    const service = OAuth2.createService(`PrinterOS`)
      .setAuthorizationBaseUrl(`https://cloud.3dprinteros.com/apiglobal/`)
      .setTokenUrl(`https://cloud.3dprinteros.com/apiglobal/login/`)
      .setTokenFormat("application/x-www-form-urlencoded")
      .setTokenHeaders({ "Authorization": "Basic " + Utilities.base64EncodeWebSafe(clientId + ":" + clientPassword) })
      .setClientId(clientId)
      .setClientSecret(clientPassword)
      .setCallbackFunction((request) => {
        const service = GetPrinterOSService();
        const isAuthorized = service.handleCallback(request);
        if (!isAuthorized) { 
          return HtmlService
            .createTemplateFromFile("auth_error")
            .evaluate();
        }
        return HtmlService
          .createTemplateFromFile("auth_success")
          .evaluate();
      })
      .setPropertyStore(PropertiesService.getUserProperties())
      .setCache(CacheService.getUserCache())
      .setLock(LockService.getUserLock())
      // .setScope('user-library-read playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private');
    if (!service.hasAccess()) throw new Error(`Missing PrinterOS Bot authorization.`);
    console.info(`Access: ${service.hasAccess()}`);
    return service;
  } catch(err) {
    console.error(`"PrinterOS_Service()" failed : ${err}`);
    return 1;
  }
}

const _tPS = () => {
  const pos = PrinterOS_Service();
  console.info(JSON.stringify(pos, null, 3))
  console.info(`Has access : ${pos.hasAccess()}`)
}

/**
 * Logs the redirect URI to register. You can also get this from File > Project Properties
 */
const GetRedirectURI = () => {
  const service = PrinterOS_Service();
  const redirectURI = service.getRedirectUri();
  console.log(redirectURI);
  return redirectURI;
}

/**
 * Unauthorizes the non-Google service. This is useful for OAuth
 * development/testing.  Run this method (Run > resetOAuth in the script
 * editor) to reset OAuth to re-prompt the user for OAuth.
 */
const ResetOAuth = () => PrinterOS_Service().reset();



/**
 * Attempts to access a non-Google API using a constructed service object.
 * @param {String} url         The URL to access.
 * @param {String} method_opt  The HTTP method. Defaults to GET.
 * @return {HttpResponse} the result from the UrlFetchApp.fetch() call.
 */
const AccessProtectedResource = () => {
  const url = `https://acorn.3dprinteros.com/apiglobal/login/`;
  try {
    const service = PrinterOS_Service();
    let isAuthorized = service.hasAccess();
    // Invoke the authorization flow using the default authorization prompt card.
    if (!isAuthorized) {
      CardService
        .newAuthorizationException()
        .setAuthorizationUrl(service.getAuthorizationUrl())
        .setResourceDisplayName(`PrinterOS Service`)
        .throwException();
    }

    // A token is present, but it may be expired or invalid. Make a request and check the response code to be sure. 
    // Make the UrlFetch request and return the result.
    const response = UrlFetchApp.fetch(url, {
      'headers': { 'Authorization' : Utilities.formatString('Bearer %s', service.getAccessToken()) },
      'method' : "GET",
      'muteHttpExceptions': true, // Prevents thrown HTTP exceptions.
    });
    const responseCode = response.getResponseCode();
    if (responseCode == 401 || responseCode == 403) isAuthorized = false;
    if (responseCode >= 200 && responseCode < 300) return response.getContentText("utf-8"); // Success 
    else throw new Error(`Server error (${responseCode}): ${RESPONSECODES[responseCode]}, ${response.getContentText("utf-8")}`);
  } catch(err) {
    console.error(`"AccessProtectedResource()" failed : ${err}`);
    return 1;
  }
}




