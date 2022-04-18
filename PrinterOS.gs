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
    // this.username = "jacobsprojectsupport@berkeley.edu";
    // this.password = "Jacobsde$ign1";
    // this.password = 'tXnPVw0zkmRcuEJkBrxv';
    this.root = 'https://cloud.3dprinteros.com/apiglobal';
    this.username = "jacobsprojectsupport@berkeley.edu";
    this.password = "Jacobsde$ign1";
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
      username : this.username,
      password : this.password,
    }
    const params = {
      "method" : "POST",
      "payload" : payload,
      followRedirects : true,
      muteHttpExceptions : false,
    };

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();
    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const session = JSON.parse(response)["message"]["session"];
        console.info(`SESSION -----> ${session}`)
        this.session = session;
        return session;
      } else return false;
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

    if(responseCode == 200) {
      const response = html.getContentText();
      return JSON.parse(response)["result"];
      // console.warn(`Logged Out : ${result}`);
    } else return false;
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

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        console.info(`CHECK SESSION ---> : ${JSON.parse(response)["message"]}`);
        return JSON.parse(response)["message"];
      } else return false;
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

    const html = await UrlFetchApp.fetch(this.root + repo, params);
    const responseCode = html.getResponseCode();

    // console.info(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    const printerListOut = [];

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const printerlist = JSON.parse(response)["message"];
        printerlist.forEach(p => {
          const data = JSON.stringify(p);
          this.printerIDs.push(p["id"]);
          this.printerIPs.push(p["local_ip"]);
          this.printerNames.push(p["name"]);
          // console.info(JSON.stringify(p));
          // printerListOut.push(JSON.stringify(p));
        })
      } else return false;
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const printerlist = JSON.parse(response)["message"];
        printerlist.forEach(p => {
          this.printerIDs.push(p["id"]);
          this.printerIPs.push(p["local_ip"]);
          this.printerNames.push(p["name"]);
          console.info(JSON.stringify(p));
          list.push(JSON.stringify(p));
        });
        return list;
      } else return false;
    }
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const types = JSON.parse(response)["message"];
        return types;
      } else return false;
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
  async GetPrintersJobList (printerID)  {
    const repo = "/get_printer_jobs";
    const payload = {
      "session" : this.session,
      "printer_id" : printerID,
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const data = JSON.parse(response)["message"];
        // data.forEach(p => {
        //   console.info(JSON.stringify(p));
        // })
        return data;
      } else return false;
    }
  }


  /**
   * Get Latest Job on this Printer.
   */
  async GetPrintersLatestJob (printerID)  {
    const repo = "/get_printer_jobs";
    const payload = {
      "session" : this.session,
      "printer_id" : printerID,
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        return JSON.parse(response)["message"][0];
      } else return false;
    }
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const res = JSON.parse(response)["message"];
        this.picture = res.picture;
        this.imgBlob = this.GetJobImage();
        res["imageBLOB"] = this.imgBlob;
        this.jobdata = res;
        return res;
      } else return false;
    }
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        return JSON.parse(response)["message"];
      } else return false;
    }
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const stuff = JSON.parse(response);
        return stuff;
      } else return false;
    }
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        return JSON.parse(response)["message"];
      } else return false;
    }
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

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const res = JSON.parse(response)["message"];
        return res;
      } else return false;
    }
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

    if(responseCode == 200) {
      const folder = DriveApp.getFoldersByName(`Job Tickets`);
      const blob = html.getBlob().setName(`IMAGE_${this.picture}`);
      return blob;
    } else return false;
  }

  /**
   * Helper Function to find the name from an ID
   */
  GetPrinterNameFromID (printerID) {
    for (const [key, value] of Object.entries(PRINTERIDS)) {
      if(printerID == value) {
        console.info(`PrinterID : ${printerID}, Printer Name : ${key}`);
        return key;
      }
    }
  }

  async WriteJobDetailsToSheet (data, sheet) {
    // Loop through to get last row and set status to received
    const thisRow = sheet.getLastRow() + 1;
    // console.info(`DATA: ${JSON.stringify(data)}`);
    try {
      const printerID = data["printer_id"];
      sheet.getRange(thisRow, 2).setValue(printerID);
      const printerName = this.GetPrinterNameFromID(printerID);
      sheet.getRange(thisRow, 3).setValue(printerName);
      const jobID = data["id"];
      sheet.getRange(thisRow, 4).setValue(jobID);
      const timestamp = data["datetime"];
      sheet.getRange(thisRow, 5).setValue(timestamp.toString());
      const email = data["email"];
      sheet.getRange(thisRow, 6).setValue(email.toString());
      const status = data["status_id"];
      sheet.getRange(thisRow, 7).setValue(status.toString());
      const duration = data["printing_duration"];
      const d = +Number.parseFloat(duration) / 3600;
      sheet.getRange(thisRow, 8).setValue(d.toFixed(2).toString());

      const elapsed = data["print_time"];
      sheet.getRange(thisRow, 10).setValue(elapsed.toString());
      const materials = data["material_type"];
      sheet.getRange(thisRow, 11).setValue(materials.toString());
      const cost = data["cost"];
      sheet.getRange(thisRow, 12).setValue(cost.toString());

      const filename = data["filename"];
      sheet.getRange(thisRow, 15).setValue(filename.toString());

      const picture = data["picture"];
      sheet.getRange(thisRow, 13).setValue(picture.toString());
      
      if(status == 11 || status == "11") SetByHeader(sheet, HEADERNAMES.status, thisRow, STATUS.queued.plaintext);
      else if(status == 21 || status == "21") SetByHeader(sheet, HEADERNAMES.status, thisRow, STATUS.inProgress.plaintext); 
      else if(status == 43 || status == "43") SetByHeader(sheet, HEADERNAMES.status, thisRow, STATUS.failed.plaintext);
      else if(status == 45 || status == "45") SetByHeader(sheet, HEADERNAMES.status, thisRow, STATUS.cancelled.plaintext);
      else if(status == 77 || status == "77") SetByHeader(sheet, HEADERNAMES.status, thisRow, STATUS.complete.plaintext);
      else SetByHeader(sheet, HEADERNAMES.status, thisRow, STATUS.queued.plaintext);
    } catch (err) {
      console.error(`${err} : Couldn't write to sheet....`);
    }

    try {
      let imageBLOB = await GetImage(picture);
      const ticket = await new Ticket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printerID,
        printDuration : duration,
        material1Quantity : materials,
        jobID : jobID,
        filename : filename,
        image : imageBLOB, 
      }).CreateTicket();
      const url = ticket.getUrl();
      sheet.getRange(thisRow, 14).setValue(url.toString());
    } catch (err) {
      console.error(`${err} : Couldn't generate a ticket....`);
    }

  }

  _CountUnique (iterable) {
    return new Set(iterable).size;
  }

}





/**
 * -----------------------------------------------------------------------------------------------------------------
 */


/**
 * Helper Function to write to a sheet
 */
/** 
const _FetchAll = async () => {
  let jobList = [];
  const pos = new PrinterOS();
  for(const [key,printer] of Object.entries(PRINTERDATA)) {
    pos.Login()
    .then( async () => {
      const jobs = await pos.GetPrintersJobList(printer.printerID);
      jobs.forEach(job => {
        jobList.push(job["id"]);
      })
    })
    .then(() => {
      jobList.reverse();
      jobList.forEach( async(jobnumber) => {
        data = await pos.GetJobInfo(jobnumber);
        // console.info(data);
        if(SHEETS[key].getName() == printer.name) {
          // console.info(key)
          ParseJobDetails(data, SHEETS[key]);
        }
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
          sheet.getRange(index + 2, 15, 1, 1).setValue(split);
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
      const j = await p.GetPrintersJobList(PRINTERDATA.Aurum.printerID);
      console.info(j)
    })
}





