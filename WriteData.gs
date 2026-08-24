

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Write all new Data To Sheet
 */
class WriteToSheet {
  constructor() {
    /** @private */
    this.pOS = new PrinterOS();
  }

  /**
   * Write All New Data to Sheet
   */
  async WriteAll() {
    try {
      const sheets = Object.values(SHEETS);
      if(!sheets.length) {
        console.warn(`"WriteAll()" ---> No sheets configured.`);
        return 0;
      }

      const loginResult = await this.pOS.Login();
      if(loginResult === false) {
        throw new Error(`PrinterOS login failed.`);
      }

      for(const sheet of sheets) {
        if(!sheet) {
          console.warn(`"_WriteAllSheets()" ---> Skipping invalid sheet.`);
          continue;
        }

        const result = await this.WriteSingleSheet(sheet);
        if(result !== 0) {
          throw new Error(`"WriteSingleSheet()" failed for "${sheet.getSheetName()}".`);
        }
      }

      const logoutResult = await this.pOS.Logout();
      if(logoutResult === false) {
        throw new Error(`PrinterOS logout failed.`);
      }

      return 0;
    } catch(err) {
      console.error(`"WriteAll()" failed: ${err}`);
      return null;
    }
  }

  /**
   * Fetch And Write
   * @param {sheet} sheet
   */
  async WriteSingleSheet(sheet = SHEETS.Spectrum) {
    try {
      if(!sheet || typeof sheet.getSheetName !== `function`) {
        throw new TypeError(`Invalid sheet supplied.`);
      }
      const sheetName = sheet.getSheetName();
      let printerData = PRINTERDATA[sheetName];
      if(!printerData) {
        throw new Error(`No printer configuration exists for "${sheetName}".`);
      }

      let machineID = printerData.printerID;
      if(!machineID) {
        throw new Error(`No printer ID configured for "${sheetName}".`);
      }

      console.warn(`Fetching New Data from PrinterOS ---> ${sheetName} @ ${machineID}`);

      const jobs = await this.pOS.GetPrintersJobList(machineID);
      if(!Array.isArray(jobs)) {
        throw new TypeError(`PrinterOS returned an invalid job list for "${sheetName}".`);
      }

      let jobList = [];
      for(const job of jobs) {
        if(!job || job.id == null) continue;

        const exists = WriteToSheet.IsValidJobID(sheet, job.id);
        if(exists === null) {
          throw new Error(`Unable to determine whether job "${job.id}" already exists.`);
        }
        if(exists) continue;
        jobList.push(job.id);
      }

      if(!jobList.length) {
        console.warn(`${sheetName} ----> Nothing New....`);
        return 0;
      }

      const rowStart = sheet.getLastRow();

      for(let i = 0; i < jobList.length; i++) {
        const jobID = jobList[i];
        const row = rowStart + i + 1;

        console.warn(`${sheetName} ----> New Job! : ${jobID}`);

        const data = await this.pOS.GetJobInfo(jobID);

        if(!data) {
          throw new Error(`No data returned for job "${jobID}".`);
        }

        const result = await this._WriteJobDetailsToSheet(
          sheet,
          row,
          data
        );

        if(result !== 0) {
          throw new Error(`Failed writing job "${jobID}" to row ${row}.`);
        }
      }
    } catch(err) {
      console.error(`"WriteSingleSheet()" failed : ${err}`);
      return null;
    }
  }

  /**
   * Write Single Sheet
   * @static
   * @public
   * @param {sheet} sheet
   */
  static async WriteSingleSheet(sheet = SHEETS.Alpha) {
    try {
      const pOS = new PrinterOS();
      pOS.Login()
        .then( async () => {
          const sheetName = sheet.getSheetName();
          let printerData = PRINTERDATA[sheetName];
          let machineID = printerData.printerID;
          console.warn(`Fetching New Data from PrinterOS ---> ${sheetName} @ ${machineID}`);

          let jobList = [];
          const jobs = await pOS.GetPrintersJobList(machineID);
          jobs.forEach(job => {
            const exists = WriteToSheet.IsValidJobID(sheet, job.id);
            if(exists) return;
            jobList.push(job.id);
          })
        
          if(jobList.length === 0) {
            console.warn(`${sheetName} ----> Nothing New....`);
            return 0;
          }
          let rowStart = sheet.getLastRow();
          jobList.forEach(async (job, idx) => {
            let row = idx + rowStart;
            console.warn(`${sheetName} ----> New Job! : ${job}`);
            let data = await pOS.GetJobInfo(job);
            await this._WriteJobDetailsToSheet(sheet, row, data);
          });
            
          return 0;
        })
        .finally( () => {
          pOS.Logout();
        });
      return 0;
    } catch(err){
      console.error(`"WriteSingleSheet()" failed: ${err}`);
      return null;
    } 
  }
  
  /**
   * Write Job Details to Sheet
   * @private
   * @param {object} data
   * @param {sheet} sheet
   */
  async _WriteJobDetailsToSheet(sheet, row, data = {}) {
    try {
      // Validate Inputs
      if(!sheet || typeof sheet.getSheetName !== `function`) {
        throw new TypeError(`Invalid sheet supplied.`);
      }

      if(!Number.isInteger(row) || row < 1) {
        throw new TypeError(`Invalid row supplied.`);
      }

      if(!data || typeof data !== `object`) {
        throw new TypeError(`Invalid job data supplied.`);
      }

      const printerName = sheet.getSheetName();
      let { 
        printer_id, 
        id, 
        datetime, 
        email, 
        status_id, 
        printing_duration, 
        filename, 
        picture, 
        weight, 
        file_cost, 
        cost, 
        extruders 
      } = data;

      if(id == null) {
        throw new Error(`Job is missing an ID.`);
      }

      const timestamp = datetime || new Date().toISOString();

      const durationValue = Number(printing_duration);
      const duration = Number.isFinite(durationValue) ? Number((durationValue / 3600).toFixed(2)) : 0;

      const weightValue = Number(weight);

      const normalizedWeight = Number.isFinite(weightValue) ? weightValue.toFixed(2) : `0.00`;

      const cleanedFilename = filename ? CleanupService.FileNameCleanup(String(filename)) : ``;

      cost = WriteToSheet.CostFromWeight(normalizedWeight);

      if(cost === null) {
        throw new Error(`Unable to calculate cost for job (${id}).`);
      }

      // let imageBLOB = await TicketService.GetImage(picture);
      // const ticket = await TicketService.CreateTicket({
      //   submissionTime : timestamp,
      //   email : email,
      //   printerName : printerName,
      //   printerID : printer_id,
      //   weight : weight,
      //   jobID : id,
      //   filename : filename,
      //   image : imageBLOB, 
      // });
      // const url = await ticket && await ticket?.getUrl()?.toString() ? await ticket?.getUrl()?.toString() : ``;

      const rowData = {
        status: StatusService.GetStatusByCode(status_id),
        printerID: printer_id,
        printerName: printerName,
        jobID: id,
        timestamp: timestamp,
        email: email,
        posStatCode: status_id || 11,
        duration: duration,
        notes: `Weight: ${normalizedWeight} @ $0.04, Total: $${cost}`,
        picture: picture,
        ticket: ``,
        filename: cleanedFilename,
        weight: normalizedWeight,
        cost: cost
      };

      SheetService.SetRowData(sheet, row, rowData);

      const statusResult = WriteToSheet.UpdateStatus(status_id, sheet, row);
      if(statusResult !== 0) {
        throw new Error(`Unable to update status for job (${id}).`);
      }

      // console.warn(`Writing to sheet ${printerName}, Data: ${JSON.stringify(rowData)}`);
      return 0;
    } catch (err) {
      console.error(`"_WriteJobDetailsToSheet()" failed: ${err}`);
      return null;
    }

  }

  /**
   * Update Status
   * @param {number} statusCode
   * @param {sheet} sheet
   * @param {number} row
   * @private
   */
  static UpdateStatus(statusCode = 44, sheet = SHEETS.Aurum, row = 2) {
    try {
      // Validate
      if(!sheet || typeof sheet.getSheetName !== `function`) {
        throw new TypeError(`Invalid sheet supplied.`);
      }

      if(!Number.isInteger(row) || row < 1) {
        throw new TypeError(`Invalid row supplied.`);
      }

      const rowData = SheetService.GetRowData(sheet, row);
      if(!rowData) {
        throw new Error(`Unable to retrieve row ${row}.`);
      }

      const status = StatusService.GetStatusByCode(statusCode);
      if(status == null) {
        throw new Error(`Unknown status code: ${statusCode}.`);
      }

      SheetService.SetByHeader(sheet, HEADERNAMES.status, row, status);

      if(statusCode === STATUS.inProgress.statusCode) {
        new CalendarFactory().CreateEvent(rowData);
      }

      return 0;
    } catch(err) {
      console.error(`"UpdateStatus()" failed: ${err}`);
      return null;
    }
  }

  // static GetPrinters() {
  //   const printers = this.pOS.GetPrinters();
  //   console.info(printers)
  // }

  /**
   * Calculate Print Cost
   * @private
   * @param {number} weight
   * @return {number} value
   */
  static CostFromWeight(weight = 0.0) {
    try {
      const numericWeight = Number(weight);

      if(!Number.isFinite(numericWeight)) {
        throw new TypeError(`Weight must be a finite number.`);
      }

      if(numericWeight < 0) {
        throw new RangeError(`Weight cannot be negative.`);
      }

      return Number((numericWeight * COSTMULTIPLIER).toFixed(2));
    } catch(err) {
      console.error(`"CostFromWeight()" failed: ${err}`);
      return null;
    }
  }

  /**
   * Check If Job Exists
   * @private
   * @param {string} jobId
   */
  static IsValidJobID(sheet = SHEETS.Spectrum, jobId = 0) {
    try {
      // Validate
      if(!sheet || typeof sheet.getSheetName !== `function`) {
        throw new TypeError(`Invalid sheet supplied.`);
      }

      if(jobId == null || jobId === ``) {
        throw new TypeError(`Invalid job ID supplied.`);
      }

      const numericJobID = Number(jobId);

      if(!Number.isFinite(numericJobID)) {
        throw new TypeError(`Job ID must resolve to a finite number.`);
      }

      const values = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID);

      if(!Array.isArray(values)) {
        throw new TypeError(`Job ID column did not return an array.`);
      }

      return values.some(value => Number(value) === numericJobID);
    } catch(err) {
      console.error(`"IsValidJobID()" failed: ${err}`);
      return null;
    }
  }

}
/**
 * Main Entry Point
 * @TRIGGERED
 */
const WriteAllNewDataToSheets = () => new WriteToSheet().WriteAll();


/**
 * Update Single Sheet
 */
const _UpdateSingle = () => WriteToSheet.WriteSingleSheet(SHEETS.Alpha);


