/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Working with Google Drive
 * @TRIGGERED once a week
 */
class DriveController {
  constructor() {
    /** @private */
    this.root = DriveApp.getRootFolder();
    /** @private */
    this.ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
    /** @private */
    this.now = new Date();
    /** @private */
    this.dateMinusOneTwenty = new Date(new Date().setDate(new Date().getDate() - 120));
  }

  /**
   * Get Files in Root
   * @return {[string]} list of files
   */
  GetAllFileNamesInRoot() {
    try {
      let out = [];
      let files = this.root.getFiles();
      while (files.hasNext()) {
        let file = files.next();
        out.push(file);
      }
      return out;
    } catch(err) {
      console.error(`"GetAllFileNamesInRoot()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Move Tickets Out Of Root
   * @return {bool} success or failure
   */
  MoveTicketsOutOfRoot() {
    try {
      const files = this.GetAllFileNamesInRoot();
      console.info(`Destination ----> ${this.ticketFolder.getName()}`);
      files.forEach(file => {
        let name = file.getName();
        if(name.includes(`Job Ticket`) || name.includes(`Job Ticket-[object Object]`) || name.includes(`PrinterOS Ticket`) || name.includes(`Job Ticket-`) || name.includes(`PrinterOSTicket`)) {
          console.warn(`Moving ----> Name : ${name}, ID : ${file.getId()}`);
          file.moveTo(this.ticketFolder);
          console.warn(`Moved ----> Name : ${name}, ID : ${file.getId()}`);
        } else {
          console.error(`No files moved....`);
          return;
        }
      });
      return 0;
    } catch(err) {
      console.error(`"MoveTicketsOutOfRoot()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Count Tickets
   */
  CountTickets() {
    let count = 0;
    let files = this.ticketFolder.next().getFiles();
    while (files.hasNext()) {
      count++;
      files.next();
    }
    console.info(`Total Tickets : ${count}`);
    return count;
  }

  /**
   * Trash Old Tickets
   */
  TrashOldTickets () {
    let files = this.ticketFolder.getFiles();
    console.info(`Folder Permissions: ${this.ticketFolder.getSharingAccess()}, Owner: ${this.ticketFolder.getOwner()}`);
    while (files.hasNext()) {
      let file = files.next();
      let date = file.getDateCreated();
      if(date < this.dateMinusOneTwenty) {
        console.warn(`Attempting delete ----> Name : ${file.getName()}, ID : ${file.getId()}, Date : ${file.getDateCreated()}, Owner: ${file.getOwner()}`);
        try {
          file.setTrashed(true);
          console.warn(`Removed ----> Name : ${file.getName()}, ID : ${file.getId()}, Date : ${file.getDateCreated()}`);
        } catch(err) {
          console.error(`Whoops: Couldn't delete ${file.getName()}, ${err}`);
          try {
            DriveApp.removeFile(file.getId());
          } catch(error) {
            console.error(`Whoops: REALLY Couldn't delete ${file.getName()}, ${error}`);
          }
        } finally {
          console.info(`This file has been handled....`);
        }
        
        
      } 
    } 
  }

  /**
   * Get Drive ID from URL
   * @param {string} url
   * @return {string} id
   */
  GetDriveIDFromUrl(url) {
    let id = "";
    const parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
    if (url.indexOf('?id=') >= 0){
      id = (parts[6].split("=")[1]).replace("&usp","");
      return id;
    }
    id = parts[5].split("/");

    var sortArr = id.sort((a,b) => b.length - a.length);
    id = sortArr[0];
    return id;
  }

  /**
   * Download File
   * @private
   */
  _DownloadFile(file) {
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















