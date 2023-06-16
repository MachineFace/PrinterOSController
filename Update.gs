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
    let imageBLOB = await this._GetImage(picture);

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

  /**
   * Find Image blob from File
   * @param {png} file
   */
  async _GetImage(pngFile) {
    const repo = `https://live3dprinteros.blob.core.windows.net/render/${pngFile}`;

    const params = {
      method : "GET",
      contentType : "image/png",
      followRedirects : true,
      muteHttpExceptions : true,
    };

    try {
      const response = await UrlFetchApp.fetch(repo, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

      const blob = response.getBlob().setName(`IMAGE_${pngFile}`);
      return blob;
    } catch(err) {
      console.error(`"GetImage()" failed : ${err}`);
      return 1;
    }
  }
}
/**
 * Main Entry Point
 * @TRIGGERED
 */
const MissingTicketUpdater = () => new UpdateMissingTickets();