/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update Data on Sheet
 */
class UpdateService {
  constructor () {

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
      let numbers = [...GetColumnDataByHeader(sheet, HEADERNAMES.jobID)];
      let statuses = [...GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode)];
      let culled = [];
      statuses.forEach((status, index) => {
        if(status == STATUS.queued.statusCode || status == STATUS.inProgress.statusCode) {
          culled.push(numbers[index]);
        }
      })
      console.info(`Numbers : ${numbers}`);
      console.info(`Stats : ${statuses}`);
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
const UpdateAll = () => new UpdateService().UpdateAll();





const _testUpdate = () => {
  const u = new UpdateService();
  u._Update(SHEETS.Aurum)
}




