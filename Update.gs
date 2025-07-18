/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update Data on Sheet
 */
class UpdateService {
  constructor () {
    /** @private */
    this.pOS = new PrinterOS();
  }
  /**
   * Update Info on the sheet.
   */
  async UpdateAll() {
    try {
      await this.pOS.Login()
        .then(() => {
          Object.values(SHEETS).forEach( async (sheet) => await this.Update(sheet));
        })
        .finally(() => this.pOS.Logout());
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
  async Update(sheet) {
    try {
      console.warn(`Updating ---> ${sheet.getSheetName()}`);
      const filtered = UpdateService.FilterJobsByQueuedOrInProgress(sheet);

      Object.entries(filtered).forEach( async([jobId, {statusCode, row}]) => {

        console.warn(`${sheet.getSheetName()} @ ${row} ----> Updating Job : ${jobId}, Status_id: ${statusCode}`);
        const data = await this.pOS.GetJobInfo(jobId);

        let { printing_duration, filename, status_id } = data;
        SheetService.SetByHeader(sheet, HEADERNAMES.posStatCode, row, status_id);

        printing_duration = Number(printing_duration / 3600).toFixed(2);
        SheetService.SetByHeader(sheet, HEADERNAMES.duration, row, printing_duration.toString());

        filename = CleanupService.FileNameCleanup(filename);
        SheetService.SetByHeader(sheet, HEADERNAMES.filename, row, filename.toString());

        const status = StatusService.GetStatusByCode(status_id);
        SheetService.SetByHeader(sheet, HEADERNAMES.status, row, status);
          
      });

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
  static FilterJobsByQueuedOrInProgress(sheet) {
    try {
      let d = {}
      let jobIds = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID)];
      let statuses = [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode)];
      jobIds.forEach((id, idx) => {
        const status_id = statuses[idx];
        const index = idx + 2;
        if(status_id == STATUS.queued.statusCode || status_id == STATUS.inProgress.statusCode) {
          d[id] = { 
            status_id : status_id,
            row : index,
          }
        }
      });

      if(Object.entries(d).length == 0) {
        console.warn(`${sheet.getSheetName()}: Nothing to Update....`);
        return {}
      }
      console.info(`Jobs to Update (${Object.entries(d).length}): ${JSON.stringify(d)}`);
      return d;
    } catch(err) {
      console.error(`"FilterJobsByQueuedOrInProgress()" failed: ${err}`);
      return {}
    }
  }

  /**
   * Update all Filenames
   */
  UpdateAllFilenames() {
    try {
      this.pOS.Login()
        .then(() => {
          Object.values(SHEETS).forEach(sheet => {
            console.info(`Updating ${sheet.getSheetName()}`);

            [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID)]
              .filter(Boolean)
              .forEach( async(jobId, index) => {
                const info = await this.pOS.GetJobInfo(jobId);
                let filename = info["filename"];
                let split = filename.slice(0, -6);
                console.info(`INDEX: ${index + 2} : FILENAME ---> ${split}`);
                SheetService.SetByHeader(sheet, HEADERNAMES.filename, index + 2, split);
              });
          });
        })
        .finally(() => this.pOS.Logout());
      return 0;
    } catch(err){
      console.error(`"UpdateAllFilenames()" failed: ${err}`);
      return 1;
    } 
  }

  /**
   * Update All Material Costs
   */
  UpdateAllMaterialCosts() {
    try {
      this.pOS.Login()
        .then(() => {
          Object.values(SHEETS).forEach(sheet => {
            console.info(`Updating Materials and Costs (${sheet.getSheetName()})`);
            this.UpdateSingleSheetMaterials(sheet);
            console.info(`Successfully Updated sheet`);
          });
        })
        .finally(() => {
          this.pOS.Logout();
        });
      return 1;
    } catch(err) {
      console.error(`"UpdateAllMaterialCosts()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Update Single Sheet Materials
   * @return {boolean} successful
   * @private
   */
  UpdateSingleSheetMaterials(sheet) {
    try {
      [...SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.jobID)]
        .filter(Boolean)
        .forEach( async(jobId, index) => {
          const weight = await this.pOS.GetMaterialWeight(jobId);
          const price = PrintCost(weight);
          // console.info(`Weight = ${weight}, Price = ${price}`);
          SheetService.SetByHeader(sheet, HEADERNAMES.weight, index + 2, weight);
          SheetService.SetByHeader(sheet, HEADERNAMES.cost, index + 2, price);
        });
      return 0;
    } catch(err){
      console.error(`"UpdateSingleSheetMaterials()" failed ${err}`);
      return 1;
    } 
  }

}

/**
 * Main Entry Point
 * @TRIGGERED
 */
const UpdateAll = () => new UpdateService().UpdateAll();

/**
 * Update all Filenames
 * @TRIGGERED
 */
const UpdateAllFilenames = () => new UpdateService().UpdateAllFilenames();

/**
 * Update All Material Costs
 * @TRIGGERED
 */
const UpdateAllMaterialCosts = () => new UpdateService().UpdateAllMaterialCosts();



