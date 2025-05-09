/**
 * -----------------------------------------------------------------------------------------------------------------
 * PrinterOS Class for handling PrinterOS requests and responses
 * API Info: https://docs.google.com/document/d/16u1uKQFML0sJ9SCdnHzcYX4eQh9dvsgeSeEtFymhTLs/edit#heading=h.tn9ro1ef6f0
 */
class PrinterOS {
  constructor(){
    /** @private */
    this.root = `https://cloud.3dprinteros.com/apiglobal`;
    /** @private */
    this.username = PropertiesService.getScriptProperties().getProperty(`POS_username`);
    /** @private */
    this.password = PropertiesService.getScriptProperties().getProperty(`POS_password`);
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
    try {
      const url = `${this.root}/login/`;
      const params = {
        'method' : "POST",
        'contentType' : "application/x-www-form-urlencoded",
        'followRedirects' : true,
        'muteHttpExceptions' : false,
        'payload' : {
          'username' : this.username,
          'password' : this.password,
        },
      }
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(!result) return result; 
      console.info(JSON.parse(content));
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
    try {
      const url = `${this.root}/logout/`;
      const params = {
        'method' : "POST",
        'contentType' : "application/x-www-form-urlencoded",
        'payload' : { 
          'session' : this.session 
        },
        'followRedirects' : true,
        'muteHttpExceptions' : false,
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
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
  async CheckSession(session) {
    try {
      const url = `${this.root}/check_session`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : session,
        },
      }
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = await JSON.parse(content)?.result;
      console.info(`(${session}) Session Valid? : ${!!result}`);

      return !!result;
    } catch(err) {
      console.error(`"CheckSession()" failed : ${err}`);
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
    try {
      const url = `${this.root}/get_organization_printers_list`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = await JSON.parse(content)?.result;
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
    try {
      const url = `${this.root}/get_printers_list`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'printer_id' : printer_id,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
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
    try {
      const url = `${this.root}/get_printer_types`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
        },
      }
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = await JSON.parse(content)?.result;
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
    try {
      const url = `${this.root}/get_printer_jobs`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'printer_id' : printerID,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();

      const result = JSON.parse(content)?.result;
      if(result == false) return false;

      const data = JSON.parse(content)?.message;
      data.forEach(p => console.info(JSON.stringify(p, null, 3)));
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
    try {
      const url = `${this.root}/get_printer_jobs`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'printer_id' : printerID,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
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
    try {
      const url = `${this.root}/get_job_info`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'job_id' : jobID,
        },
      }
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

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
    try {
      const url = `${this.root}/get_job_info`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'job_id' : jobID,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

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
    try {
      const url = `${this.root}/get_job_info`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'job_id' : jobID,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
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
    try {
      const url = `${this.root}/get_workgroups_simple_list/`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
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
    try {
      // if(this.CheckSession(this.session) == false) this.Login();
      const url = `${this.root}/get_workgroup_users`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'workgroup_id' : workgroupID,
        },
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      const content = response.getContentText();
      // console.info(content)
      const result = JSON.parse(content)?.result;
      if(result == false) return false; 

      const users = JSON.parse(content)?.message;
      // console.info(users);
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
   * Get Users
   * returns : {name= **, balance= **, monthly_quota= **, email= **, id= **}
   */
  async FixUserBalances() {
    let users = {}
    JACOBSWORKGROUPS.forEach( async (group) => {
      await this.GetUsersByWorkgroup(group)
        .then(result => {
          result.forEach(user => {
            let { id, email, name, monthly_quota, balance } = user;
            if(balance != null) {
              console.info(user);
              users[id] = user;
            }
          });
        });
    });
    return users;
  }

  /**
   * @private
   */
  async BruteForce(id = ``) {
    // let url = `https://cloud.3dprinteros.com/apiglobal/get_workgroup_users/`;
    let base_url = `https://cloud.3dprinteros.com/apiglobal`;

    const endpoints = [
      "/users",
      "/users/me",
      "/users/12345",
      "/users?email=test@example.com",
      "/user",
      "/user/profile",
      "/user/settings",
      "/profile",
      "/account",
      "/accounts",
      "/auth/me",
      "/me",
      "/settings",
      "/whoami"
    ];

    try {
      endpoints.forEach( async endpoint => {
        let url = `${base_url}${endpoint}`;
        const params = {
          'method' : "POST",
          'ContentType' : 'application/json',
          'payload' : {
            'session' : this.session,
          },
          'followRedirects' : true,
          'muteHttpExceptions' : true,
        }

        const response = await UrlFetchApp.fetch(url, params);
        const responseCode = response.getResponseCode();
        if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
        const content = response.getContentText();
        console.info(JSON.parse(content));

        // const result = JSON.parse(content)?.result;
        // if(result == false) return false; 

        // const users = JSON.parse(content)?.message;
        // // console.info(users);
        // return users;
      });


    } catch(err) {
      console.error(`"GetUserById()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get User Counts and Print to Data / Metrics
   */
  async GetUserCount() {
    try {
      let users = [];
      await JACOBSWORKGROUPS.forEach( async(group) => {
        await this.GetUsersByWorkgroup(group)
          .then(res => {
            res.forEach(user => users.push(user?.email));
          });
      });
      // console.info( await users)
      let count = new Set( await users).size;
      console.info(`User Count: ${count}`);
      return count;
    } catch(err) {
      console.error(`"GetUserCount()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get Printers in Cloud
   * @NOTIMPLEMENTED
   */
  async GetPrintersInCloud() {
    try {
      const url = `${this.root}/get_printer_types_detailed`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
      }

      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
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
    try {
      const url = `https://live3dprinteros.blob.core.windows.net/render/${this.picture}`;
      const params = {
        'method' : "GET",
        'contentType' : "image/png",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
      }

      const html = await UrlFetchApp.fetch(url, params);
      const responseCode = html.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

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
   * Add User to Workgroup
   * @private
   * @param {string} email
   * @param {int} workgroupId
   * @return {string} result
   * NOTIMPLEMENTED
  async AddUserToWorkgroup(email, workgroupId) {
    try {
      const url = `${this.root}/add_user_to_workgroup`;
      const params = {
        'method' : "POST",
        'followRedirects' : true,
        'muteHttpExceptions' : true,
        'payload' : {
          'session' : this.session,
          'workgroup_id' : workgroupId,
          'email' : email,
        },
      }
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const content = response.getContentText();
      const result = JSON.parse(content)?.result;
      if(result == false) return false;
      const out = JSON.parse(content)?.message;
      return out;
    } catch(err) {
      console.error(`"GetPrinterTypes()" failed: ${err}`);
      return 1;
    }
  }
  */


  /** 
   * Print Cost
   * @private
   */
  _PrintCost(weight = 0.0) {
    return Number(weight * COSTMULTIPLIER).toFixed(2);
  }

  /**
   * Calculate Cost Via Extruder Data
   * @private
   * NOTIMPLEMENTED
  _CalculateCost(extruders = {}) {
    try {
      console.info(`Extruders: ${extruders}`);
      const extruder1 = JSON.parse(extruders)[0].w;
      const extruder2 = JSON.parse(extruders)[1].w;
      console.info(`Extruder1: ${extruder1}, Extruder2: ${extruder2}`);
      const e1_cost = extruder1 * COSTMULTIPLIER, e2_cost = extruder2 * COSTMULTIPLIERBREAKAWAY;
      const total = e1_cost + e2_cost;
      console.info(`Value: E1: ${e1_cost}, E2: ${e2_cost}, Total = ${total}`);
      return total;
    } catch(err) {
      console.error(`_CalculateCost() failed: ${err}`);
      return 1;
    }
  }
  */

}







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




const _testPOS = async () => {
  const p = new PrinterOS();
  // console.info(p._GetUserSession())
  // console.info(p._ClearUserSession());
  // await p.Login()
    // .then(async () => await p.GetPrinters())
    // .then(async () => await p.GetPrinterTypes())
    // .then(async () => p.GetPrinterData(PRINTERIDS.Spectrum))
    // .then( async () => p.GetLatestJobsForAllPrinters())
    // .then(p.CheckSession())
    // .then(async () => await p.GetWorkGroups())
    // .then(async () => await p.GetUsersByWorkgroup())
    // .then(async () => await p.GetUsers())
    // .then(async() => {
    //   const { extruders, weight, file_cost, cost } = await p.GetJobInfo(3435856);
    //   console.info(`Extruders: ${extruders}, Weight: ${weight}, File Cost: ${file_cost}, Cost: ${cost}`);
    //   const extruder1 = JSON.parse(extruders)[0].w;
    //   const extruder2 = JSON.parse(extruders)[1].w;
    //   console.info(`Extruder1: ${extruder1}, Extruder2: ${extruder2}`);
    //   const e1_cost = extruder1 * COSTMULTIPLIER, e2_cost = extruder2 * COSTMULTIPLIERBREAKAWAY;
    //   console.info(`Value: E1: ${e1_cost}, E2: ${e2_cost}, Total = ${Number(e1_cost + e2_cost).toFixed(2)}`);
    // })
    // .finally(async () => await p.Logout())
  p.Login()
    .then(async () => {
      p.BruteForce();
      // let users = await p.FixUserBalances();
      // console.info(users)
    })
    .finally(async () => await p.Logout())
}


