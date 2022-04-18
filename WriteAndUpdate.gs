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
    let machineID = PRINTERIDS[sheet.getSheetName()];
    let jobList = [];
    let numbers = GetColumnDataByHeader(sheet, HEADERNAMES.jobID);
    const pos = new PrinterOS();
    pos.Login()
    .then( async () => {
      const jobs = await pos.GetPrintersJobList(machineID);
      jobs.forEach(job => {
        let jobnumber = Number(job["id"]);
        let index = numbers.indexOf(jobnumber);
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
          await this.WriteJobDetailsToSheet(data, sheet);
        });
      } 
    })
    .finally(() => pos.Logout());
  }
  
  async WriteJobDetailsToSheet (data, sheet) {
    const thisRow = sheet.getLastRow() + 1;
    const printerID = data["printer_id"];
    sheet.getRange(thisRow, 2).setValue(printerID);

    const printerName = sheet.getSheetName();
    sheet.getRange(thisRow, 3).setValue(printerName);

    const jobID = data["id"];
    sheet.getRange(thisRow, 4).setValue(jobID);

    const timestamp = data["datetime"] ? data["datetime"] : new Date().toISOString();
    sheet.getRange(thisRow, 5).setValue(timestamp);

    const email = data["email"] ? data["email"].toString() : "";
    sheet.getRange(thisRow, 6).setValue(email);

    const status = data["status_id"];
    sheet.getRange(thisRow, 7).setValue(status.toString());

    const duration = data["printing_duration"] ? data["printing_duration"] : 0;
    const d = +Number.parseFloat(duration) / 3600;
    sheet.getRange(thisRow, 8).setValue(d.toFixed(2).toString());

    const elapsed = data["print_time"] ? data["print_time"].toString() : 0;
    sheet.getRange(thisRow, 10).setValue(elapsed);

    const materials = data["material_type"] ? data["material_type"].toString() : "PLA";
    sheet.getRange(thisRow, 11).setValue(materials);

    const cost = data["cost"] ? data["cost"].toString() : 0;
    sheet.getRange(thisRow, 12).setValue(cost);

    // const filename = data["filename"] ? data["filename"].slice(0, -6).toString() : "";
    const filename = data["filename"] ? data["filename"].toString() : "";
    sheet.getRange(thisRow, 15).setValue(filename);

    const picture = data["picture"] ? data["picture"].toString() : "";
    sheet.getRange(thisRow, 13).setValue(picture);

    this.UpdateStatus(status, sheet, thisRow);

    try {
      let imageBLOB = await GetImage(data["picture"]);
      const ticket = await new Ticket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printerID,
        printDuration : duration,
        material1Quantity : materials,
        jobID : jobID,
        filename : filename,
        image : imageBLOB, 
      }).CreateTicket();
      const url = ticket.getUrl();
      sheet.getRange(thisRow, 14).setValue(url.toString());
    } catch (err) {
      console.error(`${err} : Couldn't generate a ticket....`);
    }

  }

  UpdateStatus (statusCode, sheet, row) {
    switch(statusCode) {
      case STATUS.queued.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.queued.plaintext);
        console.warn(`Status changed to: ${STATUS.queued.plaintext}`);
        break;
      case STATUS.inProgress.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.inProgress.plaintext);
        console.warn(`Status changed to: ${STATUS.inProgress.plaintext}`);
        break;
      case STATUS.failed.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.failed.plaintext);
        console.warn(`Status changed to: ${STATUS.failed.plaintext}`);
        break;
      case STATUS.cancelled.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.cancelled.plaintext);
        console.warn(`Status changed to: ${STATUS.cancelled.plaintext}`);
        break;
      case STATUS.complete.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.complete.plaintext);
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
    let numbers = [].concat(...sheet.getRange(2, 4, sheet.getLastRow(), 1).getValues());
    let statuses = [].concat(...sheet.getRange(2, 7, sheet.getLastRow(), 1).getValues());
    let culled = [];
    statuses.forEach((status, index) => {
      if(status == 11.0 || status == 21.0) {
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
    sheet.getRange(row, 7).setValue(status.toString());

    const duration = jobDetails["printing_duration"];
    const d = Number(duration) / 3600;
    sheet.getRange(row, 8).setValue(d.toFixed(2).toString());
    
    const elapsed = jobDetails["print_time"];
    sheet.getRange(row, 10).setValue(elapsed.toString());

    const filename = jobDetails["filename"];
    const split = filename.slice(0, -6);
    sheet.getRange(row, 15).setValue(split.toString());

    this.UpdateStatus(status, sheet, row);

  }
  UpdateStatus (statusCode, sheet, row) {
    switch(statusCode) {
      case STATUS.queued.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.queued.plaintext);
        console.warn(`Status changed to: ${STATUS.queued.plaintext}`);
        break;
      case STATUS.inProgress.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.inProgress.plaintext);
        console.warn(`Status changed to: ${STATUS.inProgress.plaintext}`);
        break;
      case STATUS.failed.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.failed.plaintext);
        console.warn(`Status changed to: ${STATUS.failed.plaintext}`);
        break;
      case STATUS.cancelled.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.cancelled.plaintext);
        console.warn(`Status changed to: ${STATUS.cancelled.plaintext}`);
        break;
      case STATUS.complete.statusCode:
        sheet.getRange(row, 1, 1, 1).setValue(STATUS.complete.plaintext);
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
    let tickets = [].concat(...sheet.getRange(2, 14, sheet.getLastRow() -1, 1).getValues());
    tickets.forEach( (item, index) => {
      if(!item) {
        indexes.push(index + 2);
      }
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
          printDuration : rowData[7],
          material1Quantity : rowData[10],
          jobID : rowData[3],
          filename : rowData[14],
          image : imageBLOB, 
        }).CreateTicket();
        const url = ticket.getUrl();
        sheet.getRange(index, 14).setValue(url.toString());
      } catch (err) {
        console.error(`${err} : Couldn't generate a ticket....`);
      }
    })
  }
}
const MissingTicketUpdater = () => new UpdateMissingTickets();


const _testWriter = () => {
  const w = new WriteToSheet();
}
const _testUpdater = () => {
  const u = new UpdateSheet();
}
