// const googleID = "576527286089-l5pr801cmggb0hisn5kcisanbsiv14ul.apps.googleusercontent.com";
// const google_secret = "6X5vHouCqFT6GeiPp3Cjmr93";
// const cody_UID = "0df1ff70722211ebbc93fbb2f3299051";

// const root = 'https://cloud.3dprinteros.com/apiglobal';
// const uid = 'ccee6140208011eca4f4fbb2f3299051';
// const username = "jacobsprojectsupport@berkeley.edu";
// const password = "Jacobsde$ign1";
// const password = 'tXnPVw0zkmRcuEJkBrxv';

const hardIDs = { 
  Luteus : "79606",
  Caerulus : "79605",
  Photon : "75677",
  Quasar : "75675",
  Zardoz : "79166",
  Viridis :"79167",
  Rubrum : "79170",
  Plumbus : "75140",
  Nimbus : "75670",
  Spectrum : "79165",
};



/**
 * PrinterOS Class for handling PrinterOS requests and responses
 */
class PrinterOS {

  constructor(){
    this.root = 'https://cloud.3dprinteros.com/apiglobal';
    this.username = "jacobsprojectsupport@berkeley.edu";
    this.password = "Jacobsde$ign1";
    this.session;
    this.printerNames = [];
    this.printerIDs = [];
    this.printerIPs = [];
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
    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const session = JSON.parse(response)["message"]["session"];
        Logger.log(`SESSION -----> ${session}`)
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
      const result = JSON.parse(response)["result"];
      Logger.log(`Logged Out : ${result}`);
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        Logger.log(`CHECK SESSION ---> : ${JSON.parse(response)["message"]}`);
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

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
          Logger.log(JSON.stringify(p));
          // printerListOut.push(JSON.stringify(p));
        })
      } else return false;
    }
    Logger.log(this.printerIDs);
    Logger.log(this.printerIPs);
    Logger.log(this.printerNames);
    return printerListOut;
  }

  /**
   * Get Printer List
   * @required {obj} session
   * @param {string} printer_type (optional, printer short type, ex. K_PORTRAIT)
   * @param {int} printer_id (optional, printer id)
   */
  async GetPrinterList (printer_type, printer_id) {
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const printerlist = JSON.parse(response)["message"];
        printerlist.forEach(p => {
          this.printerIDs.push(p["id"]);
          this.printerIPs.push(p["local_ip"]);
          this.printerNames.push(p["name"]);
          Logger.log(JSON.stringify(p));
          // printerListOut.push(JSON.stringify(p));
        })
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const types = JSON.parse(response)["message"];
        // Logger.log(JSON.stringify(types));
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const data = JSON.parse(response)["message"];
        // data.forEach(p => {
        //   Logger.log(JSON.stringify(p));
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        return JSON.parse(response)["message"][0];
      } else return false;
    }
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        const res = JSON.parse(response)["message"];
        this.picture = res.picture;
        this.imgBlob = this.GetJobImage();
        res["imageBLOB"] = this.imgBlob;
        return res;
      } else return false;
    }
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const response = html.getContentText();
      const result = JSON.parse(response)["result"];
      if(result == true) {
        return JSON.parse(response)["message"];
      } else return false;
    }
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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

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

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

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
    let image;
    Logger.log(`IMAGE ----> ${this.picture}`);
    const repo = `https://live3dprinteros.blob.core.windows.net/render/${this.picture}`;

    const params = {
      "method" : "GET",
      contentType : "image/png",
      followRedirects : true,
      muteHttpExceptions : true
    };

    const html = await UrlFetchApp.fetch(repo, params);
    const responseCode = html.getResponseCode();

    Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

    if(responseCode == 200) {
      const folder = DriveApp.getFoldersByName(`Job Tickets`);
      const blob = html.getBlob().setName(`IMAGE_${this.picture}`);
      return blob;
    } else return false;
  }

}





/**
 * ---------------------------------------------------------------------------------------------------------------------------------------------------------
 */



/**
 * Helper Function to find the name from an ID
 */
const GetPrinterNameFromID = (printerID) => {
  // printerID = 79606;
  for (const [key, value] of Object.entries(hardIDs)) {
    if(printerID == value) {
      Logger.log(`PrinterID : ${printerID}, Printer Name : ${key}`);
      return key;
    }
  }
}

/**
 * Get Latest Job from All Printers
 */
const GetLatestJobsForAllPrinters = async () => {
  const jobIDS = [];

  const pos = new PrinterOS();
  await pos.Login()
  .then(pos.CheckSession())
  .then( async () => {
    for (const [key, value] of Object.entries(hardIDs)) {
      const latestjobID = await pos.GetPrintersLatestJob(value);
      Logger.log(`Printer ----> ${key}`);
      jobIDS.push(latestjobID["id"]);
    }
  })
  .then( async () => {
    jobIDS.forEach(async (jobID) => {
      const jobDetails = await pos.GetJobInfo(jobID);
      // Logger.log(jobDetails);
      // return jobDetails;
    })
  })
  .finally(() => {
    pos.Logout();
  })
}



/**
 * Helper Function to write to a sheet
 */
const _FetchAll = async () => {
  let jobList = [];
  const pos = new PrinterOS();

  for(const [key,value] of Object.entries(hardIDs)) {
    pos.Login()
    .then( async () => {
      const jobs = await pos.GetPrintersJobList(value);
      jobs.forEach(job => {
        jobList.push(job["id"]);
      })
    })
    .then(() => {
      jobList.reverse();
      jobList.forEach( async(jobnumber) => {
        data = await pos.GetJobInfo(jobnumber);
        // Logger.log(data);
        if(SHEETS[key].getName() == key) {
          Logger.log(key)
          ParseJobDetails(data, SHEETS[key]);
        }
      })
    })
    .finally(() => pos.Logout());
  }

} 


/**
 * MAIN ENTRY POINT
 */
const WriteAllNewDataToSheets = async () => {
  FetchAndWrite(hardIDs.Spectrum, SHEETS.Spectrum);
  FetchAndWrite(hardIDs.Zardoz, SHEETS.Zardoz);
  FetchAndWrite(hardIDs.Viridis, SHEETS.Viridis);
  FetchAndWrite(hardIDs.Rubrum, SHEETS.Rubrum);
  FetchAndWrite(hardIDs.Quasar, SHEETS.Quasar);
  FetchAndWrite(hardIDs.Plumbus, SHEETS.Plumbus);
  FetchAndWrite(hardIDs.Photon, SHEETS.Photon);
  FetchAndWrite(hardIDs.Nimbus, SHEETS.Nimbus);
  FetchAndWrite(hardIDs.Luteus, SHEETS.Luteus);
  FetchAndWrite(hardIDs.Caerulus, SHEETS.Caerulus);

  // Remove all the duplicates
  for(const [key, sheet] of Object.entries(SHEETS)) {
    RemoveDuplicateRecords(sheet)
  }
  Metrics();
}

const TriggerRemoveDuplicates = () => {
  for(const [key, sheet] of Object.entries(SHEETS)) {
    RemoveDuplicateRecords(sheet);
  }
}

const FetchAndWrite = async (machineID, sheet) => {
  let jobList = [];
  const records = [];
  const numbers = sheet.getRange(2, 4, sheet.getLastRow(), 1).getValues();
  numbers.forEach(num => {
    records.push(num.toString());
  });

  const pos = new PrinterOS();

  pos.Login()
  .then( async () => {
    const jobs = await pos.GetPrintersJobList(machineID);
    jobs.forEach(job => {
      jobList.push(job["id"]);
    })
  })
  .then(() => {
    jobList.reverse();
    jobList.forEach( async(job) => {
      if(records.includes(job)) {
        // Update the info.
        const row = records.indexOf(job) + 2;
        Logger.log(`Found Record ${job} @ ${row}`);
        const info = await pos.GetJobInfo(job);
        await UpdateInfo(info, sheet, row);
        Logger.log(`Record ${job} @ ${row} was updated.`);
      } 
      else {
        // Write a new Line
        Logger.log(`New Job! : ${job}`);
        data = await pos.GetJobInfo(job);
        await ParseJobDetails(data, sheet);
      }
    });
  })
  .finally(() => pos.Logout());

} 

/**
 * Parse Job Details
 */
const ParseJobDetails = async (jobDetails, sheet) => {
  //Loop through to get last row and set status to received
  const thisRow = sheet.getLastRow() + 1;

  const printerID = jobDetails["printer_id"];
  sheet.getRange(thisRow, 2).setValue(printerID);
  const printerName = GetPrinterNameFromID(printerID);
  sheet.getRange(thisRow, 3).setValue(printerName);
  const jobID = jobDetails["id"];
  sheet.getRange(thisRow, 4).setValue(jobID);
  const timestamp = jobDetails["datetime"];
  sheet.getRange(thisRow, 5).setValue(timestamp.toString());
  const email = jobDetails["email"];
  sheet.getRange(thisRow, 6).setValue(email.toString());
  const status = jobDetails["status_id"];
  sheet.getRange(thisRow, 7).setValue(status.toString());
  const duration = jobDetails["printing_duration"];
  const d = Number(duration) / 3600;
  Logger.log(`Elapsed Time : ${d}`);
  sheet.getRange(thisRow, 8).setValue(d.toFixed(2).toString());

  const elapsed = jobDetails["print_time"];
  sheet.getRange(thisRow, 10).setValue(elapsed.toString());
  const materials = jobDetails["material_type"];
  sheet.getRange(thisRow, 11).setValue(materials.toString());
  const cost = jobDetails["cost"];
  sheet.getRange(thisRow, 12).setValue(cost.toString());
  const picture = jobDetails["picture"];
  sheet.getRange(thisRow, 13).setValue(picture.toString());
  
  let imageBLOB = await GetImage(picture);

  const ticket = await new TicketWithPicture({
    submissionTime : timestamp,
    email : email,
    printerName : printerName,
    printerID : printerID,
    printDuration : duration,
    material1Quantity : materials,
    jobID : jobID,
    image : imageBLOB, 
  }).CreateTicket();
  const url = ticket.getUrl();
  sheet.getRange(thisRow, 14).setValue(url.toString());

  if(status == 11 || status == "11") sheet.getRange(thisRow, 1, 1, 1).setValue(STATUS.queued);
  else if(status == 21 || status == "21") sheet.getRange(thisRow, 1, 1, 1).setValue(STATUS.inProgress);
  else if(status == 43 || status == "43") sheet.getRange(thisRow, 1, 1, 1).setValue(STATUS.failed);
  else if(status == 45 || status == "45") sheet.getRange(thisRow, 1, 1, 1).setValue(STATUS.cancelled);
  else if(status == 77 || status == "77") sheet.getRange(thisRow, 1, 1, 1).setValue(STATUS.complete);
  else sheet.getRange(thisRow, 1, 1, 1).setValue(STATUS.queued);

}

/**
 * Update Info on the sheet.
 */
const UpdateInfo = (jobDetails, sheet, row) => {
  //Loop through to get last row and set status to received

  const printerID = jobDetails["printer_id"];
  sheet.getRange(row, 2).setValue(printerID);
  const printerName = GetPrinterNameFromID(printerID);
  sheet.getRange(row, 3).setValue(printerName);
  const jobID = jobDetails["id"];
  sheet.getRange(row, 4).setValue(jobID);
  const timestamp = jobDetails["datetime"];
  sheet.getRange(row, 5).setValue(timestamp.toString());
  const email = jobDetails["email"];
  sheet.getRange(row, 6).setValue(email.toString());
  const status = jobDetails["status_id"];
  sheet.getRange(row, 7).setValue(status.toString());
  const duration = jobDetails["printing_duration"];
  const d = Number(duration) / 3600;
  Logger.log(`Elapsed Time : ${d}`);
  sheet.getRange(row, 8).setValue(d.toFixed(2).toString());

  const elapsed = jobDetails["print_time"];
  sheet.getRange(row, 10).setValue(elapsed.toString());
  const materials = jobDetails["material_type"];
  sheet.getRange(row, 11).setValue(materials.toString());
  const cost = jobDetails["cost"];
  sheet.getRange(row, 12).setValue(cost.toString());
  const picture = jobDetails["picture"];
  sheet.getRange(row, 13).setValue(picture.toString());

  if(status == 11 || status == "11") sheet.getRange(row, 1, 1, 1).setValue(STATUS.queued);
  else if(status == 21 || status == "21") sheet.getRange(row, 1, 1, 1).setValue(STATUS.inProgress);
  else if(status == 43 || status == "43") sheet.getRange(row, 1, 1, 1).setValue(STATUS.failed);
  else if(status == 45 || status == "45") sheet.getRange(row, 1, 1, 1).setValue(STATUS.cancelled);
  else if(status == 77 || status == "77") sheet.getRange(row, 1, 1, 1).setValue(STATUS.complete);
  else sheet.getRange(row, 1, 1, 1).setValue(STATUS.queued);

  const setCheckbox = SpreadsheetApp
    .newDataValidation()
    .requireCheckbox()
    .build();

  // Loop through all sheets and set validation to checkbox
  sheet.getRange(thisRow, 15).setDataValidation(setCheckbox);
}


/**
 * Remove Duplicate Records
 */
const RemoveDuplicateRecords = (sheet) => {
  const records = [];

  let numbers = sheet.getRange(2, 4, sheet.getLastRow() -1, 1).getValues();
  numbers.forEach(num => {
    if(num != null || num != undefined || num != "" || num != " ") {
      records.push(num.toString());
    }
  });
  
  indexes = [];
  records.forEach( (item, index) => {
    if(records.indexOf(item) !== index) {
      indexes.push(index + 2);
    }
  })
  const dups = records.filter((item, index) => records.indexOf(item) !== index);
  // Remove
  indexes.forEach(number => {
    Logger.log(`Sheet ${sheet.getSheetName()} @ INDEX : ${number}`);
    sheet.deleteRow(number);
  });
}

/**
 * Get WorkGroup Numbers
 */
const GetWorkGroups = async () => {
  const countUnique = (iterable) => {
    return new Set(iterable).size;
  }

  const pos = new PrinterOS();
  await pos.Login()
  .then(pos.CheckSession())
  .then( async () => {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    const fromDate = date.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    Logger.log(`From : ${fromDate}, To : ${toDate}`);
    const res = await pos.GetAdminReport(fromDate, toDate);

    let workgroups = [];

    res.forEach(entry => {
      if(entry[16] != null) workgroups.push(entry[16]);
    });
    workgroups.shift();
    workgroups.pop();
    workgroups = [].concat(...workgroups);
    let unique = [...new Set(workgroups)]
    Logger.log(unique);
    // const users = await pos.GetUsersByWorkgroup(0);
    // Logger.log(users);
  })
  .finally(() => pos.Logout());
}

/**
 * Get Users
 * returns : {name= **, balance= **, monthly_quota= **, email= **, id= **}
 */
const GetUsers = async () => {
  const countUnique = (iterable) => {
    return new Set(iterable).size;
  }
  
  const pos = new PrinterOS();
  pos.Login()
  .then(() => {
    let users = [];
    WORKGROUPS.forEach( async (group) => {
      const res = await pos.GetUsersByWorkgroup(group);
      let usergroup = [];
      res.forEach(user => {
        usergroup.push(user["email"]);
      })
      usergroup = [].concat(...usergroup);
      Logger.log(countUnique(usergroup))
    })
    Logger.log(users)
  })
  .finally(() => {
    pos.Logout();
  })
  
  // let count = countUnique(users);
  // Logger.log(count)
  // return count;
}

/**
 * Get User Counts and Print to Data / Metrics
 */
const GetUserCount = async () => {
  let count;
  let users = [];
  const pos = new PrinterOS();
  pos.Login()
  .then(() => {
    JACOBSWORKGROUPS.forEach( async (group) => {
      const res = await pos.GetUsersByWorkgroup(group);
      res.forEach(user => users.push(user["email"]));
    })
  })
  .then( async() => {
    let temp = await users;
    temp = [].concat(...temp);
    count = new Set(temp).size;
    Logger.log(`Count : ${count}`);
    OTHERSHEETS.Metrics.getRange(17, 3, 1, 1).setValue(count);
  })
  .finally(() => {
    pos.Logout();
  })
  return await count;
}


/**
 * UNIT TEST
 */
const _testPOS = async () => {
  const pos = new PrinterOS();
  // await pos.Login().then(session => {
  //   // pos.GetPrintersJobList(hardIDs.Spectrum);
  //   const data = pos.GetPrintersLatestJob(hardIDs.Spectrum);
  // })

  // await pos.Login()
  //   .then( async() => {
  //     const job = await pos.GetPrintersLatestJob(hardIDs.Spectrum)
  //     const jobID = job["id"];
  //     const jobDetails = await pos.GetJobInfo(jobID);
  //     Logger.log(jobDetails);
  //     const image = await pos.imgBlob;
  //     Logger.log(image)
  //   })

  await pos.Login()
  .then(pos.CheckSession())
  .then(pos.Logout());

  // await pos.Login()
  // .then( async () => {
  //   let date = new Date();
  //   date.setDate(date.getDate() - 30);
  //   const fromDate = date.toISOString().split('T')[0];
  //   const toDate = new Date().toISOString().split('T')[0];
  //   Logger.log(`From : ${fromDate}, To : ${toDate}`);
  //   pos.GetFinishedJobReport(fromDate, toDate);
  // });


  // const check = await pos.CheckSession(session);
  // Logger.log(`SESSION CHECK ----> ${check}`);

  // const printers = await pos.GetPrinters(session);
  // Logger.log(`PRINTERS ----> ${printers}`);

  // const printers = await pos.GetPrinterList("Ultimaker 3");
  // Logger.log(`PRINTERS ----> ${printers}`);

  

  // pos.GetPrintersInCloud();
  // await pos.TestFetch("http://www.google.com/");
  // await pos.TestFetch('http://cloud.3dprinteros.com/apiglobal/login');
  // pos.GetPrinters(response);
  // pos.GetPrintersJobList(response, 234918273);
}






