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
      const filtered = this._FilterJobsByQueuedOrInProgress(sheet);
      const pos = new PrinterOS();
      await pos.Login()
        .then(() => {
          Object.entries(filtered).forEach( async([jobId, {statusCode, row}]) => {

            console.warn(`${sheet.getSheetName()} @ ${row} ----> Updating Job : ${jobId}, Status_id: ${statusCode}`);
            const data = await pos.GetJobInfo(jobId);

            let { printing_duration, filename, status_id } = data;
            SetByHeader(sheet, HEADERNAMES.posStatCode, row, status_id);

            printing_duration = Number(printing_duration / 3600).toFixed(2);
            SetByHeader(sheet, HEADERNAMES.duration, row, printing_duration.toString());

            filename = FileNameCleanup(filename);
            SetByHeader(sheet, HEADERNAMES.filename, row, filename.toString());

            const status = GetStatusByCode(status_id);
            SetByHeader(sheet, HEADERNAMES.status, row, status);
              
          });
        })
        .then(async() => pos.Logout());
      return 0;
    } catch(err) {
      console.error(`"Update()" failed : ${err}`);
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
    jobIds.forEach((id, idx) => {
      const status_id = statuses[idx];
      const index = idx + 2;
      if(status_id == STATUS.queued.statusCode || status_id == STATUS.inProgress.statusCode) {
        d[id] = { 
          status_id : status_id,
          row : index,
        };
      }
    });

    if(Object.entries(d).length == 0) {
      console.warn(`${sheet.getSheetName()}: Nothing to Update....`);
      return {};
    }
    console.info(`Jobs to Update (${Object.entries(d).length}): ${JSON.stringify(d)}`);
    return d;
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




const _ert = () => {
  const jrbs = new UpdateService()._FilterJobsByQueuedOrInProgress(SHEETS.Spectrum);
  console.info(jrbs);
}



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



