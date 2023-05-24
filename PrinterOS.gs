/**
 * -----------------------------------------------------------------------------------------------------------------
 * PrinterOS Class for handling PrinterOS requests and responses
 */
class PrinterOS {
  constructor(){
    this.root = `https://cloud.3dprinteros.com/apiglobal`;
    this.session;
    this.printerNames = [];
    this.printerIDs = [];
    this.printerIPs = [];
    this.jobdata;
    this.picture;
    this.imgBlob;
  }
  

  /**
   * Login Classic : Username and Password
   * returns : session
   */
  async Login() {
    const repo = "/login/";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : false,
      "payload" : {
        username : PropertiesService.getScriptProperties().getProperty(`POS_username`),
        password : PropertiesService.getScriptProperties().getProperty(`POS_password`),
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    if(responseCode != 200) return false; 
    const response = html.getContentText();

    const result = JSON.parse(response)?.result;
    if(result == false) return false; 

    const session = JSON.parse(response)?.message?.session;
    console.info(`(${session}) Session Started: ${result}`);
    this.session = session;
    return session;

  }

  /**
   * Logout
   */
  async Logout() {
    const repo = "/logout/";
    const params = {
      method : "POST",
      payload : { session : this.session },
      followRedirects : true,
      muteHttpExceptions : false,
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    if(responseCode != 200) return false 
    else {
      const response = html.getContentText();
      const result = JSON.parse(response)?.result;
      console.warn(`(${this.session}) Session Closed: ${result}`);
      return ;
    }
  }

  /**
   * Check PrinterOS Session
   */
  async CheckSession() {
    const repo = "/check_session"
    const params = {
      method : "POST",
      followRedirects : true,
      muteHttpExceptions : true,
      payload : {
        "session" : this.session,
      },
    };
    try {
      const response = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
      const responseCode = response.getResponseCode();
      console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
      if(responseCode != 200) return false;

      const result = JSON.parse(response.getContentText())?.result;
      if(result == false) return false;
      const message = result?.message;
      console.info(`(${this.session}) Session Valid? : ${message}`);
      return message;
    } catch(err) {
      console.error(`"CheckSession()" Failed: ${err}`);
    }
  }

  /**
   * Get Organizations Printers
   * @param {obj} session
   * @param {int} printer_id (optional)
   * workgroup_id {int} (optional)
   */
  async GetPrinters() {
    const repo = "/get_organization_printers_list";
    const params = {
      "method" : "POST",
      "payload" : {
        "session" : this.session,
      },
      "followRedirects" : true,
      "muteHttpExceptions" : true
    };

    const html = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
    const responseCode = html.getResponseCode();
    console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    let printerListOut = [];

    const response = html.getContentText();
    const result = JSON.parse(response)?.result;

    if(result == false) return false;

    const printerlist = JSON.parse(response)?.message;
    printerlist.forEach(p => {
      const data = JSON.stringify(p);
      this.printerIDs.push(p.id);
      this.printerIPs.push(p.local_ip);
      this.printerNames.push(p.name);
      printerListOut.push(data);
    })
    
    
    console.info(this.printerIDs);
    console.info(this.printerIPs);
    console.info(this.printerNames);
    printerListOut.forEach(item => console.info(item));
    return printerListOut;
  }

  /**
   * Get Printer's Data
   * @required {obj} session
   * @param {string} printer_type (optional, printer short type, ex. K_PORTRAIT)
   * @param {int} printer_id (optional, printer id)
   */
  async GetPrinterData (printer_id) {
    printer_id = printer_id ? printer_id : 79170;
    const repo = "/get_printers_list";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "printer_id" : printer_id,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 

    const printerlist = JSON.parse(response)?.message;
    printerlist.forEach(p => {
      this.printerIDs.push(p.id);
      this.printerIPs.push(p.local_ip);
      this.printerNames.push(p.name);
    });
    console.info(printerlist);
    return printerlist;

    
  }

  /**
   * Get Printer Types in Cloud
   * @required {obj} session
   * @returns types
   */
  async GetPrinterTypes () {
    const repo = "/get_printer_types";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false;
    const types = JSON.parse(response)?.message;
    types.forEach(t => console.info(t));
    return types;
  }

  /**
   * Get a Specific Printer's Job List
   * @required {obj} session
   * @required {int} printerID
   * @param {int} limit (optional, default 20) - max job count in response
   * @param {int} offset (optional, default 0) - offset for pagination
   * @param {int} prev_time (optional, parameter for live update. Can be used to get only changed jobs between two requests. For first request need to send add prev_time: 0, and you will have “time” parameter in   
   * response. You need to send prev_time: “time” in next request to get only live updates)
   */
  async GetPrintersJobList (printerID)  {
    printerID = printerID ? printerID : 79165;
    const repo = "/get_printer_jobs";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "printer_id" : printerID,
      },
    };

    const html = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false;
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false;
    const data = JSON.parse(response)?.message;
    data.forEach(p => console.info(JSON.stringify(p)));
    return data;
  }

  /**
   * Get Latest Job on this Printer.
   */
  async GetPrintersLatestJob (printerID)  {
    printerID = printerID ? printerID : 79165;
    const repo = "/get_printer_jobs";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "printer_id" : printerID,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = responseCode == 200 ? html.getContentText() : false;
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 
    const job = JSON.parse(response)?.message[0];
    console.info(job);
    return job;
  }

  /**
   * Get Latest Job from All Printers
   */
  async GetLatestJobsForAllPrinters () {
    const jobIDS = [];
    for (const [key, value] of Object.entries(PRINTERIDS)) {
      const latestjob = await this.GetPrintersLatestJob(value);
      console.info(`Printer ----> ${key}`);
      console.info(latestjob);
      jobIDS.push(latestjob?.id);
    }
    return jobIDS;
  }

  /**
   * Get a Specific Job Details
   * @param {obj} session
   * @param {int} jobID
   */
  async GetJobInfo(jobID) {
    const repo = "/get_job_info";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "job_id" : jobID,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 

    const res = JSON.parse(response)?.message;
    console.info(res);
    this.picture = res?.picture;
    this.imgBlob = this.GetJobImage();
    res.imageBLOB = this.imgBlob;
    this.jobdata = res;
    return res;
  }

  /**
   * Get Material Weight
   * @param {number} jobID
   * @returns {number} Weight
   */
  async GetMaterialWeight(jobID) {
    const repo = "/get_job_info";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "job_id" : jobID,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 
    const weight = JSON.parse(response)?.message?.weight ? JSON.parse(response)?.message?.weight : 0.0;
    // console.info(`Weight: ${weight}`)
    return weight;
  }

  /**
   * Calculate Cost of a Job
   * @param {number} JobId
   * @param {number} Unit Cost
   * @returns {number} Total Cost
   */
  async CalculateCost(jobID) {
    const repo = "/get_job_info";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "job_id" : jobID,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 
    const weight = JSON.parse(response)?.message?.weight ? JSON.parse(response)?.message?.weight : 0.0;
    const price = this._PrintCost(weight);
    // console.info(`Price: ${price}`);
    return price;
    
  }

  /**
   * Get WorkGroup Numbers
   */
  async GetWorkGroups () {
    let list = [];
    const repo = `/get_workgroups_simple_list/`;
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false;
    const workgroups = JSON.parse(response)?.message;
    workgroups.forEach(w => {
      console.info(`Workgroup: ${JSON.stringify(w)}`);
      list.push(w.id);
    });
    list = [...new Set(list)]
    console.info(`LIST: ${list}`)
    return list;
  }

  /**
   * Get Users by Workgroup Assignment
   * @param {obj} session
   * @param {int} workgroupID
   */
  async GetUsersByWorkgroup (workgroupID) {
    workgroupID = workgroupID ? workgroupID : 3275;
    const repo = "/get_workgroup_users";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
        "workgroup_id" : workgroupID,
      },
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 
    const users = JSON.parse(response)?.message;
    console.info(users);
    return users;
    
  }

  /**
   * Get Users
   * returns : {name= **, balance= **, monthly_quota= **, email= **, id= **}
   */
  async GetUsers () {
    let users = [];
    WORKGROUPS.forEach( async (group) => {
      const res = await this.GetUsersByWorkgroup(group);
      let usergroup = [];
      res.forEach(user => usergroup.push(user?.email));
      usergroup = [].concat(...usergroup);
      console.info(countUnique(usergroup))
    })
    console.info(users)
    return users;
  }

  /**
   * Get User Counts and Print to Data / Metrics
   */
  async GetUserCount () {
    let users = [];
    JACOBSWORKGROUPS.forEach( async(group) => {
      const res = await this.GetUsersByWorkgroup(group)
      .then(console.info(res?.email));
      // res.forEach(user => users.push(res["email"]));
    })
    users = [].concat(...users);
    let count = new Set(users).size;
    console.info(`Count : ${count}`);
    // OTHERSHEETS.Metrics.getRange(17, 3, 1, 1).setValue(count);
    return count;
  }

  /**
   * Get Printers in Cloud
   */
  async GetPrintersInCloud () {
    const repo = "/get_printer_types_detailed";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false;
    const response = html.getContentText();
    const result = JSON.parse(response)?.result;
    if(result == false) return false; 
    const stuff = JSON.parse(response);
    console.info(stuff);
    return stuff;
  }

  /**
   * Get an Image
   */
  async GetJobImage() {
    // console.info(`IMAGE ----> ${this.picture}`);
    let image;
    const repo = `https://live3dprinteros.blob.core.windows.net/render/${this.picture}`;

    const params = {
      "method" : "GET",
      "contentType" : "image/png",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
    };

    const html = await UrlFetchApp.fetch(repo, params);
    const responseCode = html.getResponseCode();

    if(responseCode != 200) return false; 
    const blob = html.getBlob().setName(`IMAGE_${this.picture}`);
    return blob;
  }

  /**
   * Helper Function to find the name from an ID
   */
  GetPrinterNameFromID (printerID) {
    printerID = printerID ? printerID : 79165;
    for (const [name, id] of Object.entries(PRINTERIDS)) {
      if(printerID == id) {
        console.info(`PrinterID : ${printerID}, Printer Name : ${name}`);
        return name;
      }
    }
  }

  _CountUnique (iterable) {
    return new Set(iterable).size;
  }

  _PrintCost (weight) {
    weight = weight instanceof Number || weight > 0.0 ? weight : 0.0;
    return Number(weight * COSTMULTIPLIER).toFixed(2);
  }

}

const _testPOS = () => {
  const p = new PrinterOS();
  p.Login()
    .then(p.GetPrinters());
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update all Filenames
 */
const UpdateAllFilenames = () => {
  Object.values(SHEETS).forEach(sheet => {
    try {
      console.info(`Updating ${sheet.getSheetName()}`);
      const pos = new PrinterOS();
      pos.Login()
      .then(() => {
        let jobIds = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
        let culled = jobIds.filter(Boolean);
        console.info(culled);
        culled.forEach( async(jobId, index) => {
          const info = await pos.GetJobInfo(jobId);
          let filename = info["filename"];
          let split = filename.slice(0, -6);
          console.info(`INDEX: ${index + 2} : FILENAME ---> ${split}`);
          SetByHeader(sheet, HEADERNAMES.filename, index + 2, split);
        });
      })
      .finally(pos.Logout());
    } catch(err){
      console.error(`${err} : Couldn't update ${sheet.getSheetName()} with filename. Maybe it just took too long?...`);
    } 
  });
}
const _testFilename = async () => {
  UpdateAllFilenames();
}





/**
 * -----------------------------------------------------------------------------------------------------------------
 * Get Printer IDs
 * @NEEDED for adding new printers
 */
const GetPrinterIDs = () => {
  const p = new PrinterOS();
  p.Login()
    .then(() => {
      const plist = p.GetPrinterData();
      console.info(JSON.stringify(plist));
  })
  .then(() => p.Logout())
}

const GetPrinterJobs = () => {
  const p = new PrinterOS();
  p.Login()
    .then(async () => {
      const j = await p.CalculateCost(2643420)
      console.info(j)
    })
}




const UpdateSingleSheetMaterials = (sheet) => {
  try {
    console.info(`Updating Materials and Costs for ---> ${sheet.getSheetName()}`);
    const pos = new PrinterOS();
    pos.Login()
    .then(() => {
      let jobIds = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
      let culled = jobIds.filter(Boolean);
      console.info(culled);
      culled.forEach( async(jobId, index) => {
        const weight = await pos.GetMaterialWeight(jobId);
        const price = PrintCost(weight);
        // console.info(`Weight = ${weight}, Price = ${price}`);
        SetByHeader(sheet, HEADERNAMES.weight, index + 2, weight);
        SetByHeader(sheet, HEADERNAMES.cost, index + 2, price);
      });
    })
    .finally(() => {
      pos.Logout();
      console.info(`Successfully Updated ${sheet.getSheetName()}`);
    });
  } catch(err){
    console.error(`${err} : Couldn't update ${sheet.getSheetName()} with filename. Maybe it just took too long?...`);
  } 
}
const TryUpdateSingleSheetCosts = () => {
  UpdateSingleSheetMaterials(SHEETS.Spectrum);
}
const UpdateAllMaterialCosts = () => {
  Object.values(SHEETS).forEach(sheet => UpdateSingleSheetMaterials(sheet));
}


const GetPrinterData = () => {
  const p = new PrinterOS();
  p.Login()
    .then(async () => {
      let printers = await p.GetPrinters();
      console.info(printers)
    })
}



/** 
// Configure the service
const PrinterOS_Service = () => {
  const service = OAuth2.createService(`PrinterOS`)
    .setAuthorizationBaseUrl(`https://cloud.3dprinteros.com/apiglobal`)
    .setTokenUrl(`https://cloud.3dprinteros.com/apiglobal/login`)
    .setClientId(PropertiesService.getScriptProperties().getProperty(`POS_username`))
    .setClientSecret(PropertiesService.getScriptProperties().getProperty(`POS_password`))
    .setCallbackFunction((request) => {
      const service = GetPrinterOSService();
      const isAuthorized = service.handleCallback(request);
      if (isAuthorized) { 
        return HtmlService
          .createTemplateFromFile("auth_success")
          .evaluate();
      } else {
        return HtmlService
          .createTemplateFromFile("auth_error")
          .evaluate();
      }
    })
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCache(CacheService.getUserCache())
    .setLock(LockService.getUserLock())
    // .setScope('user-library-read playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private');
  // if (!service.hasAccess()) {
  //   throw new Error(`Missing PrinterOS Bot authorization.`);
  // }
  console.info(`Access: ${service.hasAccess()}`);
  return service;
}

const _tPS = () => {
  const pos = PrinterOS_Service();
  console.info(JSON.stringify(pos, 4, null))
}

// Logs the redirect URI to register. You can also get this from File > Project Properties
const GetRedirectUri = () => {
  const redirectURI = PrinterOS_Service().getRedirectUri();
  console.log(redirectURI);
  return redirectURI;
}
*/




