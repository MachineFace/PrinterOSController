

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
            if(!exists) jobList.push(jobnumber);
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

    this._UpdateStatus(statCode, sheet, thisRow);

    try {
      let imageBLOB = await GetImage(data["picture"]);
      const ticket = await new Ticket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printerID,
        weight : weight,
        jobID : jobID,
        filename : filename,
        image : imageBLOB, 
      }).CreateTicket();
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
      let jobIds = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
      if(jobIds.includes(Number(jobId))) return true;
      return false;
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







/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update Data on Sheet
 */
class UpdateSheet {
  constructor () {
    this.UpdateAll();
  }
  /**
   * Update Info on the sheet.
   */
  async UpdateAll() {
    try {
      Object.values(SHEETS).forEach( async (sheet) => await this._Update(sheet));
      return 0;
    } catch(err){
      console.error(`"UpdateAll()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Update
   * @private
   * @param {sheet} sheet
   */
  async _Update(sheet) {
    try {
      console.warn(`Updating ---> ${sheet.getSheetName()}`);
      let numbers = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
      let culled = [];
      statuses.forEach((status, index) => {
        if(status == STATUS.queued.statusCode || status == STATUS.inProgress.statusCode) {
          culled.push(numbers[index]);
        }
      })
      console.info(`JOBS --> ${JSON.stringify(culled)}`);
      if(culled.length == 0) {
        console.warn(`Nothing to Update....`);
        return 0;
      }
      const pos = new PrinterOS();
      await pos.Login()
      .then(() => {
        culled.forEach( async(job) => {
          let row = SearchSpecificSheet(sheet, job);
          console.warn(`${sheet.getName()} @ ${row} ----> Updating Job : ${job}`);
          await pos.GetJobInfo(job)
            .then( async(data) => {
              await this._UpdateInfo(data, sheet, row);
            });
        });
      })
      .then(pos.Logout());
      return 0;
    } catch(err) {
      console.error(`"Update()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Update Info
   * @private
   * @param {object} job details
   * @param {sheet} sheet
   * @param {number} row
   */
  async _UpdateInfo(jobDetails, sheet, row) {
    try {
      let { status, printing_duration, filename } = jobDetails;
      SetByHeader(sheet, HEADERNAMES.posStatCode, row, status);

      printing_duration = Number(printing_duration / 3600).toFixed(2);
      SetByHeader(sheet, HEADERNAMES.duration, row, printing_duration.toString());

      filename = FileNameCleanup(filename);
      SetByHeader(sheet, HEADERNAMES.filename, row, filename.toString());

      this._UpdateStatus(status, sheet, row);
      return 0;
    } catch(err) {
      console.error(`"_UpdateInfo()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Update Status
   * @private
   * @param {number} status code
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
}
/**
 * Main Entry Point
 * @TRIGGERED
 */
const UpdateAll = () => new UpdateSheet();


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update All Missing Tickets
 */
class UpdateMissingTickets {
  constructor() {
    this.UpdateAllTickets();
  }

  /**
   * Update All Tickets
   */
  async UpdateAllTickets () {
    // this.UpdateSheetTickets(SHEETS.Crystallum);
    Object.values(SHEETS).forEach(async (sheet) => {
      await this.UpdateSheetTickets(sheet);
    });
  }

  /**
   * Update Sheet Tickets
   * @param {sheet} sheet
   */
  async UpdateSheetTickets(sheet) {
    let indexes = [];
    let tickets = GetColumnDataByHeader(sheet, HEADERNAMES.ticket);
    tickets.forEach( (item, index) => {
      if(!item) indexes.push(index + 2);
    })
    console.warn(`${sheet.getSheetName()} ---> Missing Tickets: ${indexes}`);
    indexes.forEach(async (index) => {
      this._UpdateRow(index, sheet);
    });
  }

  /**
   * Update Row 
   * @private
   * @param {number} row index
   * @param {sheet} sheet
   */
  async _UpdateRow(index, sheet) {
    const rowData = await GetRowData(sheet, index);
    let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, } = rowData;
    let imageBLOB = await GetImage(picture);

    try {
      const t = await new Ticket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printerID,
        weight : weight,
        jobID : jobID,
        filename : filename,
        image : imageBLOB, 
      }).CreateTicket();
      const url = t.getUrl();
      SetByHeader(sheet, HEADERNAMES.ticket, index, url.toString());
    } catch (err) {
      console.error(`${err} : Couldn't generate a ticket....`);
    }
  }
}
/**
 * Main Entry Point
 * @TRIGGERED
 */
const MissingTicketUpdater = () => new UpdateMissingTickets();



