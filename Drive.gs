/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Working with Google Drive
 */
class DriveController
{
  constructor() {
    this.root = DriveApp.getRootFolder();
    this.ticketFolder = DriveApp.getFoldersByName(`Job Tickets`);
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
    console.info(`Destination ----> ${this.ticketFolder.next().getName()}`);
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
    let files = this.ticketFolder.next().getFiles();
    while (files.hasNext()) {
      count++;
      files.next();
    }
    console.info(`Total Tickets : ${count}`);
    return count;
  }

  TrashOldTickets () {
    let files = this.ticketFolder.next().getFiles();
    while (files.hasNext()) {
      let file = files.next();
      let date = file.getDateCreated();
      if(date < this.dateMinusOneTwenty) {
        // console.warn(`Deleting ----> Name : ${file.getName()}, ID : ${file.getId()}, Date : ${file.getDateCreated()}`);
        file.setTrashed(true);
        console.warn(`Removed ----> Name : ${file.getName()}, ID : ${file.getId()}, Date : ${file.getDateCreated()}`);
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
const CleanupDrive = () => new DriveController().MoveTicketsOutOfRoot();
const TrashOldTickets = () => new DriveController().TrashOldTickets();
const CountTickets = () => new DriveController().CountTickets();

/**
 * Get Drive ID from URL
 */
const GetDriveIDFromUrl = (url) => { 
  let id = "";
  const parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
  if (url.indexOf('?id=') >= 0){
    id = (parts[6].split("=")[1]).replace("&usp","");
    return id;
  } else {
    id = parts[5].split("/");
    // Using sort to get the id as it is the longest element. 
    var sortArr = id.sort(function(a,b){return b.length - a.length});
    id = sortArr[0];
    return id;
  }
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Test Drive Functions
 */
const _testDrive = () => {
  // let date = new Date();
  // let dateMinusNinety = new Date(new Date().setDate(date.getDate() - 120));
  // console.info(`90 Days ago : ${dateMinusNinety}, Now : ${date}`);
  let d = new DriveController();
  d.TrashOldTickets();
}









