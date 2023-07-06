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
      const filtered = [...this._FilterJobsByQueuedOrInProgress(sheet)];
      const pos = new PrinterOS();
      await pos.Login()
        .then(() => {
          filtered?.forEach( async(job) => {
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
      let { status_id, printing_duration, filename } = jobDetails;
      SetByHeader(sheet, HEADERNAMES.posStatCode, row, status_id);

      printing_duration = Number(printing_duration / 3600).toFixed(2);
      SetByHeader(sheet, HEADERNAMES.duration, row, printing_duration.toString());

      filename = FileNameCleanup(filename);
      SetByHeader(sheet, HEADERNAMES.filename, row, filename.toString());

      this._UpdateStatus(status_id, sheet, row);
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
      const status = GetStatusByCode(statusCode);
      SetByHeader(sheet, HEADERNAMES.status, row, status);
      if(statusCode == STATUS.inProgress.statusCode) c.CreateEvent(rowData);
      else c.DeleteEvent(rowData?.jobId);
      return 0;
    } catch(err) {
      console.error(`"_UpdateStatus()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Filter Jobs By Queued Or InProgress
   * @private
   * @param {sheet} sheet
   * @return {[number]} jobIds
   */
  _FilterJobsByQueuedOrInProgress(sheet) {
    let d = {};
    let jobIds = [...GetColumnDataByHeader(sheet, HEADERNAMES.jobID)];
    let statuses = [...GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode)];
    jobIds.forEach((id, idx) => d[id] = statuses[idx]);

    Object.entries(d).forEach(([id, status], idx) => {
      if(status != STATUS.queued.statusCode && status != STATUS.inProgress.statusCode) {
        delete d[id];
      }
    });
    const filtered = [...Object.keys(d)];
    console.info(filtered);
    if(filtered.length == 0) {
      console.warn(`Nothing to Update....`);
      return [];
    }
    return filtered;
  }
}

/**
 * Main Entry Point
 * @TRIGGERED
 */
const UpdateAll = () => new UpdateService().UpdateAll();





/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update all Filenames
 */
const UpdateAllFilenames = () => {
  try {
    Object.values(SHEETS).forEach(sheet => {
      console.info(`Updating ${sheet.getSheetName()}`);
      const pos = new PrinterOS();
      pos.Login()
        .then(() => {
          [...GetColumnDataByHeader(sheet, HEADERNAMES.jobID)]
            .filter(Boolean)
            .forEach( async(jobId, index) => {
              const info = await pos.GetJobInfo(jobId);
              let filename = info["filename"];
              let split = filename.slice(0, -6);
              console.info(`INDEX: ${index + 2} : FILENAME ---> ${split}`);
              SetByHeader(sheet, HEADERNAMES.filename, index + 2, split);
            });
        })
        .finally(pos.Logout());
    });
  } catch(err){
    console.error(`"UpdateAllFilenames()" failed : ${err} : Couldn't update ${sheet.getSheetName()} with filename.`);
    return 1;
  } 
}
const _testFilename = async () => UpdateAllFilenames();







/**
 * Update Single Sheet Materials
 * @return {boolean} successful
 */
const UpdateSingleSheetMaterials = (sheet) => {
  try {
    console.info(`Updating Materials and Costs for ---> ${sheet.getSheetName()}`);
    const pos = new PrinterOS();
    pos.Login()
      .then(() => {
        GetColumnDataByHeader(sheet, HEADERNAMES.jobID)
          .filter(Boolean)
          .forEach( async(jobId, index) => {
            const weight = await pos.GetMaterialWeight(jobId);
            const price = PrintCost(weight);
            // console.info(`Weight = ${weight}, Price = ${price}`);
            SetByHeader(sheet, HEADERNAMES.weight, index + 2, weight);
            SetByHeader(sheet, HEADERNAMES.cost, index + 2, price);
          });
      })
      .finally(() => {
        pos.Logout();
        console.info(`Successfully Updated ${sheet.getSheetName()}`);
      });
    return 0;
  } catch(err){
    console.error(`"UpdateSingleSheetMaterials()" failed ${err} : Couldn't update ${sheet.getSheetName()} with filename.`);
    return 1;
  } 
}

/**
 * Update All Material Costs
 */
const UpdateAllMaterialCosts = () => Object.values(SHEETS).forEach(sheet => UpdateSingleSheetMaterials(sheet));



