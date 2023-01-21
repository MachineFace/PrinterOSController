/**
 * Write all new Data To Sheet
 */
class WriteToSheet
{
  constructor() {
    this.WriteAllNewDataToSheets();
  }

  async WriteAllNewDataToSheets () {
    Object.values(SHEETS).forEach( async (sheet) => {
      try {
        console.warn(`Fetching New Data from PrinterOS ---> ${sheet.getSheetName()}`);
        await this.FetchAndWrite(sheet);
      } catch(err){
        console.error(`${err} : Couldn't write data to sheet. Maybe it just took too long?...`);
      } 
    })
  }

  async FetchAndWrite (sheet) {
    // let machineID = PRINTERDATA[sheet.getSheetName()];
    let machineID = PRINTERIDS[sheet.getSheetName()];
    let jobList = [];
    let jobIDs = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
    const pos = new PrinterOS();
    pos.Login()
    .then( async () => {
      const jobs = await pos.GetPrintersJobList(machineID);
      jobs.forEach(job => {
        let jobnumber = Number(job["id"]);
        let index = jobIDs.indexOf(jobnumber);
        // console.info(`Index: ${index}`);
        if(index == -1) jobList.push(jobnumber);
      })
      console.warn(jobList);
    })
    .then(() => {
      if(jobList.length === 0) console.warn(`${sheet.getSheetName()} ----> Nothing New....`);
      else {
        jobList.forEach(async (job) => {
          console.warn(`${sheet.getSheetName()} ----> New Job! : ${job}`);
          let data = await pos.GetJobInfo(job)
          console.warn(`Writing to sheet ${sheet.getSheetName()}, Data: ${JSON.stringify(data)}`);
          await this.WriteJobDetailsToSheet(data, sheet);
        });
      } 
    })
    .finally(() => pos.Logout());
  }
  
  async WriteJobDetailsToSheet (data, sheet) {
    const thisRow = sheet.getLastRow() + 1;
    const printerID = data["printer_id"];
    SetByHeader(sheet, HEADERNAMES.printerID, thisRow, printerID);

    const printerName = sheet.getSheetName();
    SetByHeader(sheet, HEADERNAMES.printerName, thisRow, printerName);

    const jobID = data["id"];
    SetByHeader(sheet, HEADERNAMES.jobID, thisRow, jobID);

    const timestamp = data["datetime"] ? data["datetime"] : new Date().toISOString();
    SetByHeader(sheet, HEADERNAMES.timestamp, thisRow, timestamp);

    const email = data["email"] ? data["email"].toString() : "";
    SetByHeader(sheet, HEADERNAMES.email, thisRow, email);

    const statCode = data["status_id"];
    SetByHeader(sheet, HEADERNAMES.posStatCode, thisRow, statCode.toString());

    const duration = data["printing_duration"] ? data["printing_duration"] : 0;
    const d = +Number.parseFloat(duration) / 3600;
    SetByHeader(sheet, HEADERNAMES.duration, thisRow, d.toFixed(2).toString());

    const filename = data["filename"] ? FileNameCleanup(data["filename"].toString()) : "";
    SetByHeader(sheet, HEADERNAMES.filename, thisRow, filename);

    const picture = data["picture"] ? data["picture"].toString() : "";
    SetByHeader(sheet, HEADERNAMES.picture, thisRow, picture);

    const weight = data["weight"] ? Number(data["weight"]).toFixed(2) : 0.0;
    SetByHeader(sheet, HEADERNAMES.weight, thisRow, weight);

    const cost = weight ? PrintCost(weight) : 0.0;
    SetByHeader(sheet, HEADERNAMES.cost, thisRow, cost);

    this.UpdateStatus(statCode, sheet, thisRow);

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
    } catch (err) {
      console.error(`${err} : Couldn't generate a ticket....`);
    }

  }

  UpdateStatus (statusCode, sheet, row) {
    switch(statusCode) {
      case STATUS.queued.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.queued.plaintext);
        console.warn(`Status changed to: ${STATUS.queued.plaintext}`);
        break;
      case STATUS.inProgress.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.inProgress.plaintext);
        console.warn(`Status changed to: ${STATUS.inProgress.plaintext}`);
        break;
      case STATUS.failed.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.failed.plaintext);
        console.warn(`Status changed to: ${STATUS.failed.plaintext}`);
        break;
      case STATUS.cancelled.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.cancelled.plaintext);
        console.warn(`Status changed to: ${STATUS.cancelled.plaintext}`);
        break;
      case STATUS.complete.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.complete.plaintext);
        console.warn(`Status changed to: ${STATUS.complete.plaintext}`);
        break;
      default:
        console.warn(`Status NOT changed`);
        break;
    }
    return 1;
  }

}

/**
 * Update Data on Sheet
 */
class UpdateSheet
{
  constructor () {
    this.UpdateAll();
  }
  /**
   * -----------------------------------------------------------------------------------------------------------------
   * Update Info on the sheet.
   */
  async UpdateAll () {
    // this.Update(SHEETS.Photon);
    Object.values(SHEETS).forEach( async (sheet) => {
      try {
        console.warn(`Updating ---> ${sheet.getSheetName()}`);
        await this.Update(sheet);
      } catch(err){
        console.error(`${err} : Couldn't update sheet. Maybe it just took too long?...`);
      }
    });
  }
  async Update (sheet) {
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
      return 1;
    }
    const pos = new PrinterOS();
    await pos.Login()
    .then(() => {
      culled.forEach( async(job) => {
        let row = SearchSpecificSheet(sheet, job);
        console.warn(`${sheet.getName()} @ ${row} ----> Updating Job : ${job}`);
        await pos.GetJobInfo(job)
          .then( async(data) => {
            await this.UpdateInfo(data, sheet, row);
          });
      });
    })
    .finally(pos.Logout());
  }
  async UpdateInfo (jobDetails, sheet, row) {

    const status = jobDetails["status_id"];
    SetByHeader(sheet, HEADERNAMES.posStatCode, row, status.toString());

    const duration = jobDetails["printing_duration"];
    const d = Number(duration) / 3600;
    SetByHeader(sheet, HEADERNAMES.duration, row, d.toFixed(2).toString());

    const filename = FileNameCleanup(jobDetails["filename"]);
    SetByHeader(sheet, HEADERNAMES.filename, row, filename.toString());

    this.UpdateStatus(status, sheet, row);

  }
  UpdateStatus (statusCode, sheet, row) {
    switch(statusCode) {
      case STATUS.queued.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.queued.plaintext);
        console.warn(`Status changed to: ${STATUS.queued.plaintext}`);
        break;
      case STATUS.inProgress.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.inProgress.plaintext);
        console.warn(`Status changed to: ${STATUS.inProgress.plaintext}`);
        break;
      case STATUS.failed.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.failed.plaintext);
        console.warn(`Status changed to: ${STATUS.failed.plaintext}`);
        break;
      case STATUS.cancelled.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.cancelled.plaintext);
        console.warn(`Status changed to: ${STATUS.cancelled.plaintext}`);
        break;
      case STATUS.complete.statusCode:
        SetByHeader(sheet, HEADERNAMES.status, row, STATUS.complete.plaintext);
        console.warn(`Status changed to: ${STATUS.complete.plaintext}`);
        break;
      default:
        console.warn(`Status NOT changed`);
        break;
    }
    return 1;
  }
}

/**
 * Main Entry Points
 */
const WriteAllNewDataToSheets = () => new WriteToSheet();
const UpdateAll = () => new UpdateSheet();


class UpdateMissingTickets
{
  constructor() {
    this.UpdateAllTickets();
  }
  async UpdateAllTickets () {
    // this.UpdateSheetTickets(SHEETS.Crystallum);
    Object.values(SHEETS).forEach(async (sheet) => {
      await this.UpdateSheetTickets(sheet);
    });
  }
  async UpdateSheetTickets (sheet) {
    let indexes = [];
    let tickets = GetColumnDataByHeader(sheet, HEADERNAMES.ticket);
    tickets.forEach( (item, index) => {
      if(!item) indexes.push(index + 2);
    })
    console.warn(`${sheet.getSheetName()} ---> Missing Tickets: ${indexes}`);
    this.UpdateRow(indexes, sheet);
  }
  UpdateRow(indexes, sheet) {
    let rowData = [];
    let headers = [].concat(...sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues());
    // console.info(headers);
    indexes.forEach(async (index) => {
      rowData = [].concat(...sheet.getRange(index, 1, 1, sheet.getLastColumn()).getValues());
      // console.info(rowData);
      try {
        let imageBLOB = await GetImage(rowData[12]);
        const ticket = await new Ticket({
          submissionTime : rowData[4],
          email : rowData[5],
          printerName : rowData[2],
          printerID : rowData[1],
          weight : rowData[15],
          jobID : rowData[3],
          filename : rowData[14],
          image : imageBLOB, 
        }).CreateTicket();
        const url = ticket.getUrl();
        SetByHeader(sheet, HEADERNAMES.ticket, index, url.toString());
      } catch (err) {
        console.error(`${err} : Couldn't generate a ticket....`);
      }
    })
  }
}
const MissingTicketUpdater = () => new UpdateMissingTickets();






const FetchNewDataforSingleSheet = (sheet) => {

    // let machineID = PRINTERDATA[sheet.getSheetName()];
    let machineID = PRINTERIDS[sheet.getSheetName()];
    let jobList = [];
    let jobIDs = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
    const pos = new PrinterOS();
    pos.Login()
    .then( async () => {
      const jobs = await pos.GetPrintersJobList(machineID);
      jobs.forEach(job => {
        let jobnumber = Number(job["id"]);
        let index = jobIDs.indexOf(jobnumber);
        // console.info(`Index: ${index}`);
        if(index == -1) jobList.push(jobnumber);
      })
    })
    .then(() => {
      if(jobList.length === 0) console.warn(`${sheet.getSheetName()} ----> Nothing New....`);
      else {
        jobList.forEach(async (job) => {
          console.warn(`${sheet.getSheetName()} ----> New Job! : ${job}`);
          let data = await pos.GetJobInfo(job)
          console.warn(`Writing to sheet ${sheet.getSheetName()}, Data: ${JSON.stringify(data)}`);
          const thisRow = sheet.getLastRow() + 1;
          const printerID = data["printer_id"];
          SetByHeader(sheet, HEADERNAMES.printerID, thisRow, printerID);

          const printerName = sheet.getSheetName();
          SetByHeader(sheet, HEADERNAMES.printerName, thisRow, printerName);

          const jobID = data["id"];
          SetByHeader(sheet, HEADERNAMES.jobID, thisRow, jobID);

          const timestamp = data["datetime"] ? data["datetime"] : new Date().toISOString();
          SetByHeader(sheet, HEADERNAMES.timestamp, thisRow, timestamp);

          const email = data["email"] ? data["email"].toString() : "";
          SetByHeader(sheet, HEADERNAMES.email, thisRow, email);

          const statCode = data["status_id"];
          SetByHeader(sheet, HEADERNAMES.posStatCode, thisRow, statCode.toString());

          const duration = data["printing_duration"] ? data["printing_duration"] : 0;
          const d = +Number.parseFloat(duration) / 3600;
          SetByHeader(sheet, HEADERNAMES.duration, thisRow, d.toFixed(2).toString());

          const weight = data["weight"] ? data["weight"].toString() : 0.0;
          SetByHeader(sheet, HEADERNAMES.weight, thisRow, weight);

          const cost = weight ? PrintCost(weight) : 0.0;
          SetByHeader(sheet, HEADERNAMES.cost, thisRow, cost);

          // const filename = data["filename"] ? data["filename"].slice(0, -6).toString() : "";
          const filename = data["filename"] ? FileNameCleanup(data["filename"].toString()) : "";
          SetByHeader(sheet, HEADERNAMES.filename, thisRow, filename);

          const picture = data["picture"] ? data["picture"].toString() : "";
          SetByHeader(sheet, HEADERNAMES.picture, thisRow, picture);

          switch(statusCode) {
            case STATUS.queued.statusCode:
              SetByHeader(sheet, HEADERNAMES.status, row, STATUS.queued.plaintext);
              console.warn(`Status changed to: ${STATUS.queued.plaintext}`);
              break;
            case STATUS.inProgress.statusCode:
              SetByHeader(sheet, HEADERNAMES.status, row, STATUS.inProgress.plaintext);
              console.warn(`Status changed to: ${STATUS.inProgress.plaintext}`);
              break;
            case STATUS.failed.statusCode:
              SetByHeader(sheet, HEADERNAMES.status, row, STATUS.failed.plaintext);
              console.warn(`Status changed to: ${STATUS.failed.plaintext}`);
              break;
            case STATUS.cancelled.statusCode:
              SetByHeader(sheet, HEADERNAMES.status, row, STATUS.cancelled.plaintext);
              console.warn(`Status changed to: ${STATUS.cancelled.plaintext}`);
              break;
            case STATUS.complete.statusCode:
              SetByHeader(sheet, HEADERNAMES.status, row, STATUS.complete.plaintext);
              console.warn(`Status changed to: ${STATUS.complete.plaintext}`);
              break;
            default:
              console.warn(`Status NOT changed`);
              break;
          } 

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
          } catch (err) {
            console.error(`${err} : Couldn't generate a ticket....`);
          }
        });
      } 
    })
    .finally(() => pos.Logout());
}


