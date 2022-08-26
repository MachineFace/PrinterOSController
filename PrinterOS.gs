/**
 * -----------------------------------------------------------------------------------------------------------------
 * PrinterOS Class for handling PrinterOS requests and responses
 */
class PrinterOS {
  constructor(){
    // this.googleID = "576527286089-l5pr801cmggb0hisn5kcisanbsiv14ul.apps.googleusercontent.com";
    // this.google_secret = "6X5vHouCqFT6GeiPp3Cjmr93";
    // this.cody_UID = "0df1ff70722211ebbc93fbb2f3299051";
    // this.uid = 'ccee6140208011eca4f4fbb2f3299051';
    // this.password = 'tXnPVw0zkmRcuEJkBrxv';
    // this.username = "jacobsprojectsupport@berkeley.edu";
    // this.password = "Jacobsde$ign1";
    this.root = 'https://cloud.3dprinteros.com/apiglobal';
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
    const payload = {
      username : `jacobsprojectsupport@berkeley.edu`,
      password : `Jacobsde$ign1`,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : false,
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    else {
      const session = JSON.parse(response)["message"]["session"];
      console.info(`SESSION -----> ${session}`)
      this.session = session;
      return session;
    }
    
  }

  /**
   * Logout
   */
  async Logout() {
    const repo = "/logout/";
    const params = {
      "method" : "POST",
      "payload" : { session : this.session },
      followRedirects : true,
      muteHttpExceptions : false,
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    if(responseCode != 200) return false 
    else {
      const response = html.getContentText();
      return JSON.parse(response)["result"];
      // console.warn(`Logged Out : ${result}`);
    }
  }
  

  /**
   * Check PrinterOS Session
   */
  async CheckSession() {
    const repo = "/check_session"
    const payload = {
      "session" : this.session,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false 
    else {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == false) return false;
      else {
        console.info(`CHECK SESSION ---> : ${JSON.parse(response)["message"]}`);
        return JSON.parse(response)["message"];
      }
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
    const payload = {
      "session" : this.session,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    const printerListOut = [];

    if(responseCode != 200) return false; 
    else {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == false) return false;
      else {
        const printerlist = JSON.parse(response)["message"];
        printerlist.forEach(p => {
          const data = JSON.stringify(p);
          this.printerIDs.push(p["id"]);
          this.printerIPs.push(p["local_ip"]);
          this.printerNames.push(p["name"]);
          // console.info(JSON.stringify(p));
          // printerListOut.push(JSON.stringify(p));
        })
      }
    }
    console.info(this.printerIDs);
    console.info(this.printerIPs);
    console.info(this.printerNames);
    return printerListOut;
  }

  /**
   * Get Printer List
   * @required {obj} session
   * @param {string} printer_type (optional, printer short type, ex. K_PORTRAIT)
   * @param {int} printer_id (optional, printer id)
   */
  async GetPrinterList (printer_type, printer_id) {
    const list = [];
    const repo = "/get_printers_list";
    const payload = {
      "session" : this.session,
      "printer_type" : printer_type,
      "printer_id" : printer_id,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 

    const printerlist = JSON.parse(response)["message"];
    printerlist.forEach(p => {
      this.printerIDs.push(p["id"]);
      this.printerIPs.push(p["local_ip"]);
      this.printerNames.push(p["name"]);
      console.info(JSON.stringify(p));
      list.push(JSON.stringify(p));
    });
    return list;

    
  }

  /**
   * Get Printer Types in Cloud
   * @required {obj} session
   * @returns types
   */
  async GetPrinterTypes () {
    const repo = "/get_printer_types";
    const payload = {
      "session" : this.session,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false;
    const types = JSON.parse(response)["message"];
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
    const repo = "/get_printer_jobs";
    const params = {
      "method" : "POST",
      "payload" : {
        "session" : this.session,
        "printer_id" : printerID,
      },
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(`${this.root}${repo}`, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false;
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false;
    const data = JSON.parse(response)["message"];
    // data.forEach(p => {
    //   console.info(JSON.stringify(p));
    // })
    return data;
  }


  /**
   * Get Latest Job on this Printer.
   */
  async GetPrintersLatestJob (printerID)  {
    const repo = "/get_printer_jobs";
    const params = {
      "method" : "POST",
      "payload" : {
        "session" : this.session,
        "printer_id" : printerID,
      },
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false; 
    const response = responseCode == 200 ? html.getContentText() : false;
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    return JSON.parse(response)["message"][0];
  }


  /**
   * Get Latest Job from All Printers
   */
  async GetLatestJobsForAllPrinters () {
    const jobIDS = [];
    for (const [key, value] of Object.entries(PRINTERIDS)) {
      const latestjobID = await this.GetPrintersLatestJob(value);
      console.info(`Printer ----> ${key}`);
      jobIDS.push(latestjobID["id"]);
    }
    jobIDS.forEach(async (jobID) => console.info(jobID));
    return jobIDS;
  }


  /**
   * Get a Specific Job Details
   * @param {obj} session
   * @param {int} jobID
   */
  async GetJobInfo(jobID) {
    const repo = "/get_job_info";
    const payload = {
      "session" : this.session,
      "job_id" : jobID,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 

    const res = JSON.parse(response)["message"];
    this.picture = res.picture;
    this.imgBlob = this.GetJobImage();
    res["imageBLOB"] = this.imgBlob;
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
    const payload = {
      "session" : this.session,
      "job_id" : jobID,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    const weight = JSON.parse(response)["message"].weight ? JSON.parse(response)["message"].weight : 0.0;
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
    const payload = {
      "session" : this.session,
      "job_id" : jobID,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    const weight = JSON.parse(response)["message"].weight ? JSON.parse(response)["message"].weight : 0.0;
    const price = Number(weight * COSTMULTIPLIER).toFixed(2);
    return price;
    
  }


  /**
   * Get WorkGroup Numbers
   */
  async GetWorkGroups () {
    
    let date = new Date();
    date.setDate(date.getDate() - 1);
    const fromDate = date.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    console.info(`From : ${fromDate}, To : ${toDate}`);
    const res = await this.GetAdminReport(fromDate, toDate);

    let workgroups = [];
    res.forEach(entry => {
      if(entry[16] != null) workgroups.push(entry[16]);
    });
    workgroups.shift();
    workgroups.pop();
    workgroups = [].concat(...workgroups);
    let unique = [...new Set(workgroups)]
    console.info(unique);
    return unique;

  }


  /**
   * Get Users by Workgroup Assignment
   * @param {obj} session
   * @param {int} workgroupID
   */
  async GetUsersByWorkgroup (workgroupID) {
    const repo = "/get_workgroup_users";
    const payload = {
      "session" : this.session,
      "workgroup_id" : workgroupID,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    return JSON.parse(response)["message"];
    
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
      res.forEach(user => usergroup.push(user["email"]));
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
      .then(console.info(res["email"]));
      // res.forEach(user => users.push(res["email"]));
    })
    users = [].concat(...users);
    let count = new Set(users).size;
    console.info(`Count : ${count}`);
    // OTHERSHEETS.Metrics.getRange(17, 3, 1, 1).setValue(count);
    return count;
  }


  /**
   * Get Printers in Cloud - No input params
   */
  async GetPrintersInCloud () {
    const repo = "/get_printer_types_detailed";
    const params = {
      "method" : "POST",
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false;
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    const stuff = JSON.parse(response);
    console.info(stuff);
    return stuff;
  }

  /**
   * Get a Custom Admin Report
   * @required {obj} session
   * @param {string} from (optional, Y-m-d date string, for ex 2019-06-01; default is today-31 days)
   * @param {string} to (optional Y-m-d date string, for ex 2019-06-01; default is today; max range for from-to is 365 days)
   * @param {string} type (optional, type of response: json or csv; default is csv)
   * @param {int} workgroups (optional, 1 or 0; add to response fields connected with workgroups: Workgroup IDs, Workgroup Names, and Workgroup Passwords; default is 0; id user is in multiple workgroups   
   * @param {int} all_fields (optional, 1 or 0; show all available fields or only fields that were selected in organizational settings tab; default is 0)
   */
  async GetAdminReport(fromDate, toDate ) {
    const repo = "/get_custom_report";
    const payload = {
      "session" : this.session,
      "from" : fromDate,
      "to" : toDate,
      "type" : "json",
      "workgroups" : 1,
      "all_fields" : 1,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };
    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    return JSON.parse(response)["message"];
  }


  /**
   * Get Finished Job Report
   * session
   * from (optional, string; Y-m-d date string, for ex 2019-06-01; default is today-31 days)
   * to (optional, string; Y-m-d date string, for ex 2019-06-01; default is today; max range for from-to is 365 days)
   */
  async GetFinishedJobReport(fromDate, toDate) {
    const repo = "/get_finished_jobs_report";
    const payload = {
      "session" : this.session,
      "from" : fromDate,
      "to" : toDate,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);
    if(responseCode != 200) return false; 
    const response = html.getContentText();
    const result = JSON.parse(response)["result"];
    if(result == false) return false; 
    const res = JSON.parse(response)["message"];
    return res;
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
      contentType : "image/png",
      followRedirects : true,
      muteHttpExceptions : true
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

}

const _testPOS = () => {
  const p = new PrinterOS();
  p.Login()
    .then(() => {
      p.GetLatestJobsForAllPrinters();
    })
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 */


/**
 * Helper Function to write to a sheet
 * @NOTIMPLEMENTED
 *
const _TestFetchAll = async () => {
  let jobList = [];
  const pos = new PrinterOS();
  for(const [key,printer] of Object.entries(PRINTERDATA)) {
    pos.Login()
      .then( async () => {
        const jobs = await pos.GetPrintersJobList(printer.printerID);
        jobs.forEach(job => jobList.push(job["id"]));
      })
      .then(() => {
        jobList.reverse();
        jobList.forEach( async(jobnumber) => {
          data = await pos.GetJobInfo(jobnumber);
          console.info(data);
          // if(SHEETS[key].getName() == printer.name) {
          //   // console.info(key)
          //   ParseJobDetails(data, SHEETS[key]);
          // }
        })
      })
      .finally(() => pos.Logout());
  }

} 
*/

/**
 * Remove Dup Users
 */
/** 
const RemoveDuplicateUsers = async () => {
  let ids = GetColumnDataByHeader(OTHERSHEETS.Users, "ID");
  let dups = [];
  const uniqueElements = new Set(ids);
  ids.filter( (item, index) => {
    if (uniqueElements.has(item)) {
      uniqueElements.delete(item);
    } else {
      console.warn(`REMOVING : ${index + 2} : ${item}`);
      OTHERSHEETS.Users.deleteRow(index + 2);
      OTHERSHEETS.Users.insertRowAfter(OTHERSHEETS.Users.getMaxRows() - 1 );
      dups.push(item);
    }
  });
}
*/





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
const FinalReport = async () => {
  const pos = new PrinterOS();
  await pos.Login()
  .then(async () => {
    const fromDate = new Date(2021, 8, 1);
    const toDate = new Date(2021, 12, 15);
    const info = await pos.GetFinishedJobReport(fromDate, toDate);
    info.forEach( (item, index) => {
      // OTHERSHEETS.Report.getRange(2 + index, 1, 1, 1).setValue(item.lastname)
      // OTHERSHEETS.Report.getRange(2 + index, 2, 1, 1).setValue(item.firstname)
      // OTHERSHEETS.Report.getRange(2 + index, 3, 1, 1).setValue(item.email)
      console.info(item);
    })
  })
  .then(pos.Logout());
}
*/




/**
 * -----------------------------------------------------------------------------------------------------------------
 * Get Printer IDs
 * @NEEDED for adding new printers
 */
const GetPrinterIDs = () => {
  const p = new PrinterOS();
  p.Login()
    .then(() => {
      const plist = p.GetPrinterList();
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
        const price = Number(weight * COSTMULTIPLIER).toFixed(2);
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



