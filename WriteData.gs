

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Write all new Data To Sheet
 */
class WriteToSheet {
  constructor() {

  }

  /**
   * Write All New Data to Sheet
   */
  async WriteAll() {
    try {
      Object.values(SHEETS).forEach( async (sheet) => {
        console.warn(`Fetching New Data from PrinterOS ---> ${sheet.getSheetName()}`);
        await this.WriteSingleSheet(sheet);
      });
      return 0;
    } catch(err){
      console.error(`"WriteAll()" failed : ${err}`);
      return 1;
    } 
  }

  /**
   * Fetch And Write
   * @param {sheet} sheet
   */
  async WriteSingleSheet(sheet = SHEETS.Spectrum) {
    try {
      let jobList = [];
      const pos = new PrinterOS();
      pos.Login()
        .then( async () => {
          let machineID = PRINTERIDS[sheet.getSheetName()];
          const jobs = await pos.GetPrintersJobList(machineID);
          jobs.forEach(job => {
            const exists = this._CheckIfJobExists(sheet, job.id);
            if(!exists) jobList.push(job.id);
          })
          console.warn(jobList);
        })
        .then(() => {
          if(jobList.length === 0) {
            console.warn(`${sheet.getSheetName()} ----> Nothing New....`);
            return 0;
          } else {
            jobList.forEach(async (job) => {
              console.warn(`${sheet.getSheetName()} ----> New Job! : ${job}`);
              let data = await pos.GetJobInfo(job);
              console.warn(`Writing to sheet ${sheet.getSheetName()}, Data: ${JSON.stringify(data)}`);
              await this._WriteJobDetailsToSheet(data, sheet);
            });
          }
        })
        .then(() => pos.Logout());
      return 0;
    } catch(err) {
      console.error(`"WriteSingleSheet()" failed : ${err}`);
      return 1;
    }
  }
  
  /**
   * Write Job Details to Sheet
   * @private
   * @param {object} data
   * @param {sheet} sheet
   * @return {bool} 0 or 1
   */
  async _WriteJobDetailsToSheet(data, sheet) {
    try {
      const thisRow = sheet.getLastRow() + 1;
      const printerName = sheet.getSheetName();
      let { printer_id, id, datetime, email, status_id, printing_duration, filename, picture, weight, file_cost, cost, extruders } = data;
      const timestamp = datetime ? datetime : new Date().toISOString();

      printing_duration = printing_duration ? Number.parseFloat(printing_duration) : 0.0;
      const duration = printing_duration ? +Number(printing_duration / 3600).toFixed(2) : 0;
      filename = filename ? FileNameCleanup(filename.toString()) : "";

      weight = weight ? Number(weight).toFixed(2) : 0.0;

      // Calculate Cost
      const extruder1 = JSON.parse(extruders)[0].w ? JSON.parse(extruders)[0].w : JSON.parse(extruders)[0];
      const extruder2 = JSON.parse(extruders)[1].w ? JSON.parse(extruders)[1].w : JSON.parse(extruders)[1];
      console.info(`Extruder1: ${extruder1}, Extruder2: ${extruder2}`);
      const e1_cost = extruder1 * COSTMULTIPLIER, e2_cost = extruder2 * COSTMULTIPLIERBREAKAWAY;
      const total_cost = Number(e1_cost + e2_cost).toFixed(2);

      cost = total_cost ? total_cost : this._PrintCost(weight);

      let imageBLOB = await GetImage(picture);
      const ticket = await new Ticket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printer_id,
        weight : weight,
        jobID : id,
        filename : filename,
        image : imageBLOB, 
      }).CreateTicket()
      const url = ticket.getUrl() ? ticket.getUrl() : ``;

      const rowData = { 
        status : GetStatusByCode(status_id),
        printerID : printer_id,
        printerName : printerName,
        jobID : id,
        timestamp : timestamp,
        email : email,
        posStatCode : status_id ? status_id : 11,
        duration : duration,
        notes : `Extruder 1 Weight: ${extruder1} @ $0.04, Extruder 2 Weight: ${extruder2} @ $0.20, Total: $${total_cost}`,
        picture : picture,
        ticket : url,
        filename : filename,
        weight : weight,
        cost : cost,
      }
      this._SetRowData(sheet, rowData);
      // this._SetRowData(OTHERSHEETS.All, rowData);
      this._UpdateStatus(status_id, sheet, thisRow);

      return 0;
    } catch (err) {
      console.error(`"_WriteJobDetailsToSheet()" failed : ${err}`);
      return 1;
    }

  }

  /**
   * Update Status
   * @private
   * @param {number} statusCode
   * @param {sheet} sheet
   * @param {number} row
   */
  _UpdateStatus(statusCode, sheet, row) {
    try {
      const c = new CalendarFactory();
      const rowData = GetRowData(sheet, row);
      const status = GetStatusByCode(statusCode);
      SetByHeader(sheet, HEADERNAMES.status, row, status);
      if(statusCode == STATUS.inProgress.statusCode) c.CreateEvent(rowData);
      return 0;
    } catch(err) {
      console.error(`"_UpdateStatus()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Calculate Print Cost
   * @private
   * @param {number} weight
   * @return {number} value
   */
  _PrintCost(weight = 0.0) {
    return Number(weight * COSTMULTIPLIER).toFixed(2);
  }

  /**
   * Check If Job Exists
   * @private
   * @param {string} jobId
   * @return {bool} true if exists 
   */
  _CheckIfJobExists(sheet = SHEETS.Spectrum, jobId = 0) {
    try {
      let jobIds = [...GetColumnDataByHeader(sheet, HEADERNAMES.jobID)];
      return jobIds.includes(Number(jobId));
    } catch(err) {
      console.error(`"_CheckIfJobExists()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Set Row Data
   * @param {sheet} sheet
   * @param {object} rowdata to write
   * @return {number} success or failure
   */
  _SetRowData(sheet, data) {
    try {
      let sorted = [];
      const headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
      headers.forEach( (name, index) => {
        headers[index] = Object.keys(HEADERNAMES).find(key => HEADERNAMES[key] === name);
      })

      headers.forEach( (header, index) => {
        sorted[index] = data[header];
      });

      sheet.appendRow(sorted);
      return 0;
    } catch (err) {
      console.error(`"_SetRowData()" failed : ${err}`);
      return 1;
    }
  }

}
/**
 * Main Entry Point
 * @TRIGGERED
 */
const WriteAllNewDataToSheets = () => new WriteToSheet().WriteAll();
const WriteSingleSheet = (sheet) => new WriteToSheet().WriteSingleSheet(sheet);



const _UpdateSingle = () => {
  new WriteToSheet().WriteSingleSheet(SHEETS.Crystallum)
}


