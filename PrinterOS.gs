/**
 * -----------------------------------------------------------------------------------------------------------------
 * PrinterOS Class for handling PrinterOS requests and responses
 */
class PrinterOS {
  constructor(){
    /** @private */
    this.root = `https://cloud.3dprinteros.com/apiglobal`;
    /** @private */
    this.session;
    /** @private */
    this.printerNames = [];
    /** @private */
    this.printerIDs = [];
    /** @private */
    this.printerIPs = [];
    /** @private */
    this.jobdata;
    /** @private */
    this.picture;
    /** @private */
    this.imgBlob;
  }
  

  /**
   * Login Classic : Username and Password
   * @return {string} session
   */
  async Login() {
    const repo = "/login/";
    const params = {
      method : "POST",
      contentType : "application/x-www-form-urlencoded",
      followRedirects : true,
      muteHttpExceptions : false,
      payload : {
        username : PropertiesService.getScriptProperties().getProperty(`POS_username`),
        password : PropertiesService.getScriptProperties().getProperty(`POS_password`),
      },
    };
    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(!result) return result; 

      const session = JSON.parse(content)?.message?.session;
      console.info(`(${session}) Session Started: ${result}`);
      this.session = session;
      return session;
    } catch(err) {
      console.error(`"Login()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Logout
   * return {bool} 0 or 1
   */
  async Logout() {
    const repo = "/logout/";
    const params = {
      method : "POST",
      contentType : "application/x-www-form-urlencoded",
      payload : { session : this.session },
      followRedirects : true,
      muteHttpExceptions : false,
    };

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();
      const result = JSON.parse(content)?.result;
      console.warn(`(${this.session}) Session Closed: ${result}`);
      return 0;
    } catch(err) {
      console.error(`"Logout()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Check PrinterOS Session
   * @return {string} bool
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
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const result = JSON.parse(response.getContentText())?.result;
      if(!result) return result?.message;
      const message = result?.message;
      console.info(`(${this.session}) Session Valid? : ${message}`);
      return message;
    } catch(err) {
      console.error(`"CheckSession()" Failed: ${err}`);
      return 1;
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
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
      },
    };

    try {
      const response = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false;
      const printerlist = JSON.parse(content)?.message;

      let printerListOut = [];
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
    } catch(err) {
      console.error(`"GetPrinters()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Printer's Data
   * @required {obj} session
   * @param {int} printer_id (optional, printer id)
   */
  async GetPrinterData(printer_id = 79165) {
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

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false; 

      const printerlist = JSON.parse(content)?.message;
      printerlist.forEach(p => {
        this.printerIDs.push(p.id);
        this.printerIPs.push(p.local_ip);
        this.printerNames.push(p.name);
      });
      console.info(printerlist);
      return printerlist;
    } catch(err) {
      console.error(`"GetPrinterData()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Printer Types in Cloud
   * @required {obj} session
   * @return types
   */
  async GetPrinterTypes() {
    const repo = "/get_printer_types";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
      },
    };
    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const content = response.getContentText();
      const result = JSON.parse(content)?.result;
      if(result == false) return false;
      const types = JSON.parse(content)?.message;
      types.forEach(t => console.info(t));
      return types;
    } catch(err) {
      console.error(`"GetPrinterTypes()" failed: ${err}`);
      return 1;
    }
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
  async GetPrintersJobList(printerID = 79165)  {
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

    try {
      const response = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false;

      const data = JSON.parse(content)?.message;
      data.forEach(p => console.info(JSON.stringify(p)));
      return data;
    } catch(err) {
      console.error(`"GetPrintersJobList()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Latest Job on this Printer.
   * @return {object} job data
   */
  async GetPrintersLatestJob(printerID = 79165)  {
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

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false; 
      const job = JSON.parse(content)?.message[0];
      console.info(job);
      return job;
    } catch(err) {
      console.error(`"GetPrintersLatestJob()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Latest Job from All Printers
   */
  async GetLatestJobsForAllPrinters() {
    try {
      let jobIDS = [];
      for (const [key, value] of Object.entries(PRINTERIDS)) {
        const latestjob = await this.GetPrintersLatestJob(value);
        console.info(`Printer ----> ${key}, ${latestjob}`);
        jobIDS.push(latestjob?.id);
      }
      return jobIDS;
    } catch(err) {
      console.error(`"GetLatestJobsForAllPrinters()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get a Specific Job Details
   * @required {int} jobID
   * @return {object} job data
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
    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const content = response.getContentText();
      const result = JSON.parse(content)?.result;
      if(result == false) return false; 

      const res = JSON.parse(content)?.message;
      console.info(res);
      this.picture = res?.picture;
      this.imgBlob = this.GetJobImage();
      res.imageBLOB = this.imgBlob;
      this.jobdata = res;
      return res;
    } catch(err) {
      console.error(`"GetJobInfo()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Material Weight
   * @param {number} jobID
   * @return {number} Weight
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

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const content = response.getContentText();
      const result = JSON.parse(content)?.result;
      if(result == false) return false; 
      const weight = JSON.parse(content)?.message?.weight ? JSON.parse(content)?.message?.weight : 0.0;
      console.info(`Weight: ${weight}`);
      return weight;
    } catch(err) {
      console.error(`"GetMaterialWeight()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Calculate Cost of a Job
   * @param {number} JobId
   * @param {number} Unit Cost
   * @return {number} Total Cost
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

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false; 

      const weight = JSON.parse(content)?.message?.weight ? JSON.parse(content)?.message?.weight : 0.0;
      const price = this._PrintCost(weight);
      // console.info(`Price: ${price}`);
      return price;
    } catch(err) {
      console.error(`"CalculateCost()" failed : ${err}`);
      return 1;
    }
    
  }

  /**
   * Get WorkGroup Numbers
   * @return {[number]} list of numbers
   */
  async GetWorkGroups() {
    const repo = `/get_workgroups_simple_list/`;
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
      "payload" : {
        "session" : this.session,
      },
    };

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false;

      const workgroups = JSON.parse(content)?.message;
      let list = [];
      workgroups.forEach(w => {
        console.info(`Workgroup: ${JSON.stringify(w)}`);
        list.push(w.id);
      });
      list = [...new Set(list)];
      return list;
    } catch(err) {
      console.error(`"GetWorkGroups()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Users by Workgroup Assignment
   * @param {obj} session
   * @param {int} workgroupID
   */
  async GetUsersByWorkgroup(workgroupID = 3275) {
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

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false; 

      const users = JSON.parse(content)?.message;
      console.info(users);
      return users;
    } catch(err) {
      console.error(`"GetUsersByWorkgroup()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Users
   * returns : {name= **, balance= **, monthly_quota= **, email= **, id= **}
   */
  async GetUsers() {
    let users = [];
    WORKGROUPS.forEach( async (group) => {
      let usergroup = [];
      const res = await this.GetUsersByWorkgroup(group);
      res.forEach(user => usergroup.push(user?.email));
      usergroup = [].concat(...usergroup);
      console.info([...new Set(usergroup)]);
    })
    console.info(users)
    return users;
  }

  /**
   * Get User Counts and Print to Data / Metrics
   */
  async GetUserCount() {
    try {
      let users = [];
      JACOBSWORKGROUPS.forEach( async(group) => {
        const res = await this.GetUsersByWorkgroup(group)
        console.info(res?.email);
        res.forEach(user => users.push(user.email));
      })
      let count = new Set(users).size;
      console.info(`Count : ${count}`);
      return count;
    } catch(err) {
      console.error(`"GetUserCount()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Printers in Cloud
   */
  async GetPrintersInCloud() {
    const repo = "/get_printer_types_detailed";
    const params = {
      "method" : "POST",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
    };

    try {
      const response = await UrlFetchApp.fetch(this.root + repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false;

      const stuff = JSON.parse(content);
      console.info(stuff);
      return stuff;
    } catch(err) {
      console.error(`"GetPrintersInCloud()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get an Image
   */
  async GetJobImage() {
    const repo = `https://live3dprinteros.blob.core.windows.net/render/${this.picture}`;
    const params = {
      "method" : "GET",
      "contentType" : "image/png",
      "followRedirects" : true,
      "muteHttpExceptions" : true,
    };

    try {
      const html = await UrlFetchApp.fetch(repo, params);
      const responseCode = html.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const blob = html.getBlob().setName(`IMAGE_${this.picture}`);
      return blob;
    } catch(err) {
      console.error(`"GetJobImage()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Helper Function to find the name from an ID
   */
  GetPrinterNameFromID(printerID = 79165) {
    try {
      for (const [name, id] of Object.entries(PRINTERIDS)) {
        if(printerID == id) {
          console.info(`PrinterID : ${printerID}, Printer Name : ${name}`);
          return name;
        }
      }
    } catch(err) {
      console.error(`"GetPrinterNameFromID()" failed : ${err}`);
      return 1;
    }
  }


  /** 
   * Print Cost
   * @private
   */
  _PrintCost(weight = 0.0) {
    return Number(weight * COSTMULTIPLIER).toFixed(2);
  }

}





/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update all Filenames
 */
const UpdateAllFilenames = () => {
  try {
    Object.values(SHEETS).forEach(sheet => {
      console.info(`Updating ${sheet.getSheetName()}`);
      const pos = new PrinterOS();
      pos.Login()
        .then(() => {
          GetColumnDataByHeader(sheet, HEADERNAMES.jobID)
            .filter(Boolean)
            .forEach( async(jobId, index) => {
              const info = await pos.GetJobInfo(jobId);
              let filename = info["filename"];
              let split = filename.slice(0, -6);
              console.info(`INDEX: ${index + 2} : FILENAME ---> ${split}`);
              SetByHeader(sheet, HEADERNAMES.filename, index + 2, split);
            });
        })
        .finally(pos.Logout());
    });
  } catch(err){
    console.error(`"UpdateAllFilenames()" failed : ${err} : Couldn't update ${sheet.getSheetName()} with filename.`);
  } 
}
const _testFilename = async () => UpdateAllFilenames();







/**
 * Update Single Sheet Materials
 * @return {boolean} successful
 */
const UpdateSingleSheetMaterials = (sheet) => {
  try {
    console.info(`Updating Materials and Costs for ---> ${sheet.getSheetName()}`);
    const pos = new PrinterOS();
    pos.Login()
      .then(() => {
        GetColumnDataByHeader(sheet, HEADERNAMES.jobID)
          .filter(Boolean)
          .forEach( async(jobId, index) => {
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
    return 0;
  } catch(err){
    console.error(`"UpdateSingleSheetMaterials()" failed ${err} : Couldn't update ${sheet.getSheetName()} with filename.`);
    return 1;
  } 
}

/**
 * Update All Material Costs
 */
const UpdateAllMaterialCosts = () => Object.values(SHEETS).forEach(sheet => UpdateSingleSheetMaterials(sheet));


/**
 * Fetch All Printer Data from Organization
 */
const GetPrinterData = () => {
  const p = new PrinterOS();
  p.Login()
    .then(async () => {
      let printers = await p.GetPrinters();
      console.info(printers)
    })
}




// const _testPOS = async () => {
//   const p = new PrinterOS();
//   await p.Login()
//     // .then(async () => await p.GetPrinters())
//     // .then(async () => p.GetPrinterData(PRINTERIDS.Spectrum))
//     // .then(p.CheckSession())
//     // .then(async () => await p.GetWorkGroups())
//     // .then(p.Users)
//     .then(async () => await p.Logout())
// }


