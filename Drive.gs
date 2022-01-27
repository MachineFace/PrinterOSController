/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Working with Google Drive
 */
class Drive
{
  constructor() {
    this.root = DriveApp.getRootFolder();
    this.destination = DriveApp.getFoldersByName(`Job Tickets`);
    this.destinationID = DriveApp.getFolderById(`1OJj0dxsa2Sf_tIBUnKm_BDmY7vFNMXYC`);
    this.now = new Date();
    this.dateMinusOneTwenty = new Date(new Date().setDate(new Date().getDate() - 120));
  }

  GetAllFileNamesInRoot () {
    let out = [];
    let files = this.root.getFiles();
    while (files.hasNext()) {
      let file = files.next();
      out.push(file);
    }
    return out;
  }

  MoveTicketsOutOfRoot () {
    const files = this.GetAllFileNamesInRoot();
    console.info(`Destination ----> ${this.destination.next().getName()}`);
    files.forEach(file => {
      let name = file.getName();
      if(name == `Job Ticket` || name == `Job Ticket-[object Object]` || name == `PrinterOS Ticket` || name.includes(`Job Ticket-`)) {
        console.warn(`Moving ----> Name : ${name}, ID : ${file.getId()}`);
        file.moveTo(this.destinationID);
        console.warn(`Moved ----> Name : ${name}, ID : ${file.getId()}`);
      } else {
        console.error(`No files moved....`);
        return;
      }
    });
  }

  CountTickets () {
    let count = 0;
    let files = this.destination.next().getFiles();
    while (files.hasNext()) {
      count++;
      files.next();
    }
    console.info(`Total Tickets : ${count}`);
    return count;
  }

  TrashOldTickets () {
    let files = this.destination.next().getFiles();
    while (files.hasNext()) {
      let file = files.next();
      let date = file.getDateCreated();
      if(date < this.dateMinusOneTwenty) {
        console.warn(`Deleting ----> Name : ${file.getName()}, ID : ${file.getId()}, Date : ${file.getDateCreated()}`);
        file.setTrashed(true);
        console.warn(`Removed : ${file.getId()}`);
      } 
    } 
  }

  DownloadFile (file) {
    const fileID = file.getId();
    const fileName = file.getName();
    const fileString = fileID.getContentAsString();
    return ContentService.createTextOutput(fileString).downloadAsFile(fileName);
  }
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Main Cleanup Function
 */
const CleanupDrive = () => new Drive().MoveTicketsOutOfRoot();


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Test Drive Functions
 */
const _testDrive = () => {
  // let date = new Date();
  // let dateMinusNinety = new Date(new Date().setDate(date.getDate() - 90));
  // const fromDate = date.toISOString().split('T')[0];
  // const toDate = new Date().toISOString().split('T')[0];
  // console.info(`90 Days ago : ${dateMinusNinety}, Now : ${date}`);
  let d = new Drive().CountTickets();
}









