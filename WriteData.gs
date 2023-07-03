

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
          }
          jobList.forEach(async (job) => {
            console.warn(`${sheet.getSheetName()} ----> New Job! : ${job}`);
            let data = await pos.GetJobInfo(job)
            console.warn(`Writing to sheet ${sheet.getSheetName()}, Data: ${JSON.stringify(data)}`);
            await this._WriteJobDetailsToSheet(data, sheet);
          });
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
      let { printer_id, id, datetime, email, status_id, printing_duration, filename, picture, weight, } = data;

      SetByHeader(sheet, HEADERNAMES.printerName, thisRow, printerName);
      SetByHeader(sheet, HEADERNAMES.printerID, thisRow, printer_id);
      SetByHeader(sheet, HEADERNAMES.jobID, thisRow, id);
      const timestamp = datetime ? datetime : new Date().toISOString();
      SetByHeader(sheet, HEADERNAMES.timestamp, thisRow, timestamp);
      SetByHeader(sheet, HEADERNAMES.email, thisRow, email);
      SetByHeader(sheet, HEADERNAMES.posStatCode, thisRow, status_id);

      const duration = printing_duration ? printing_duration : 0;
      const d = +Number.parseFloat(duration) / 3600;
      SetByHeader(sheet, HEADERNAMES.duration, thisRow, d.toFixed(2).toString());

      filename = filename ? FileNameCleanup(filename.toString()) : "";
      SetByHeader(sheet, HEADERNAMES.filename, thisRow, filename);
      SetByHeader(sheet, HEADERNAMES.picture, thisRow, picture);

      weight = weight ? Number(weight).toFixed(2) : 0.0;
      SetByHeader(sheet, HEADERNAMES.weight, thisRow, weight);

      const cost = weight ? this._PrintCost(weight) : 0.0;
      SetByHeader(sheet, HEADERNAMES.cost, thisRow, cost);

      this._UpdateStatus(status_id, sheet, thisRow);

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
      const url = ticket.getUrl();
      SetByHeader(sheet, HEADERNAMES.ticket, thisRow, url.toString());
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
      switch(statusCode) {
        case STATUS.queued.statusCode:
          SetByHeader(sheet, HEADERNAMES.status, row, STATUS.queued.plaintext);
          console.warn(`Status changed to: ${STATUS.queued.plaintext}`);
          break;
        case STATUS.inProgress.statusCode:
          SetByHeader(sheet, HEADERNAMES.status, row, STATUS.inProgress.plaintext);
          console.warn(`Status changed to: ${STATUS.inProgress.plaintext}`);
          c.CreateEvent(rowData);
          break;
        case STATUS.failed.statusCode:
          SetByHeader(sheet, HEADERNAMES.status, row, STATUS.failed.plaintext);
          console.warn(`Status changed to: ${STATUS.failed.plaintext}`);
          c.DeleteEvent(rowData?.jobId);
          break;
        case STATUS.cancelled.statusCode:
          SetByHeader(sheet, HEADERNAMES.status, row, STATUS.cancelled.plaintext);
          console.warn(`Status changed to: ${STATUS.cancelled.plaintext}`);
          c.DeleteEvent(rowData?.jobId);
          break;
        case STATUS.complete.statusCode:
          SetByHeader(sheet, HEADERNAMES.status, row, STATUS.complete.plaintext);
          console.warn(`Status changed to: ${STATUS.complete.plaintext}`);
          break;
        default:
          console.warn(`Status NOT changed`);
          break;
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
      let jobIds = [...GetColumnDataByHeader(sheet, HEADERNAMES.jobID)];
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
const WriteSingleSheet = (sheet) => new WriteToSheet().WriteSingleSheet();


const testT = () => {
  const w = new WriteToSheet().WriteSingleSheet(SHEETS.Aurum);
}





