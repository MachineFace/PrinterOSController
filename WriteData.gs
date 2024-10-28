

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
      filename = filename ? CleanupService.FileNameCleanup(filename.toString()) : "";

      weight = weight ? Number(weight).toFixed(2) : 0.0;

      // Calculate Cost
      const total_cost = Number(weight * COSTMULTIPLIER).toFixed(2);
      cost = total_cost ? total_cost : this._PrintCost(weight);

      let imageBLOB = await GetImage(picture);
      const ticket = await TicketService.CreateTicket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printer_id,
        weight : weight,
        jobID : id,
        filename : filename,
        image : imageBLOB, 
      });
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
        notes : `Weight: ${weight} @ $0.04, Total: $${total_cost}`,
        picture : picture,
        ticket : url,
        filename : filename,
        weight : weight,
        cost : cost,
      }
      SheetService.SetRowData(sheet, thisRow, rowData);
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
      const rowData = SheetService.GetRowData(sheet, row);
      const status = GetStatusByCode(statusCode);
      SheetService.SetByHeader(sheet, HEADERNAMES.status, row, status);
      if(statusCode == STATUS.inProgress.statusCode) {
        new CalendarFactory().CreateEvent(rowData);
      }
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
      let jobIds = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID)];
      return jobIds.includes(Number(jobId));
    } catch(err) {
      console.error(`"_CheckIfJobExists()" failed : ${err}`);
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


