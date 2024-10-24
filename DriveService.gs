/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Working with Google Drive
 * @TRIGGERED once a week
 */
class DriveController {
  constructor() {
    /** @private */
    this.ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
  }

  /**
   * Get Files in Root
   * @return {[string]} list of files
   */
  static get AllFileNamesInRoot() {
    try {
      let out = [];
      let files = DriveApp.getRootFolder().getFiles();
      while (files.hasNext()) {
        let file = files.next();
        console.info(file.getName());
        out.push(file);
      }
      return out;
    } catch(err) {
      console.error(`"AllFileNamesInRoot()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Move Tickets Out Of Root
   * @return {bool} success or failure
   */
  MoveTicketsOutOfRoot() {
    try {
      const files = DriveController.AllFileNamesInRoot;
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
    try {
      let count = 0;
      let files = this.ticketFolder.getFiles();
      while (files.hasNext()) {
        count++;
        files.next();
      }
      console.info(`Total Tickets : ${count}`);
      return count;
    } catch(err) {
      console.error(`"CountTickets()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Trash Old Tickets
   * ** Note: this function needed a timeout. Otherwise it runs forever
   */
  TrashOldTickets() {
    try {
      const date120DaysAgo = new Date(new Date().setDate(new Date().getDate() - 120));
      console.warn(`DELETING TICKETS OLDER THAN 120 Days ago ---> ${date120DaysAgo}`);
      const files = this.ticketFolder.getFiles();
      const startTime = new Date().getTime();
      const timeout = 5.9 * 60 * 1000;
      while (files.hasNext() && (new Date().getTime() - startTime < timeout)) {
        let file = files.next();
        let date = file.getDateCreated();
        if(date > date120DaysAgo) continue;
        let fileName = file.getName(), id = file.getId();
        let tag = `File: ${fileName}, ID: ${id}, Date: ${date}`;
        file.setTrashed(true);
        console.warn(`DELETED: (${tag})`);
        if(!file.isTrashed()) throw new Error(`Whoops: Couldn't delete (${tag})`);
      } 
      return 0;
    } catch(err) {
      console.error(`"TrashOldTickets()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Trash Old Tickets
   */
  static TrashOldestTicketsFirst() {
    try {
      const date120DaysAgo = new Date(new Date().setDate(new Date().getDate() - 120));
      console.warn(`DELETING TICKETS OLDER THAN 120 Days ago ---> ${date120DaysAgo}`);
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      const files = ticketFolder.getFiles();
    
      let fileList = [];
      while (files.hasNext()) {
        let file = files.next();
        if(file.getDateCreated() > date120DaysAgo) continue;
        fileList.push({
          file: file,
          createdDate: file.getDateCreated()
        });
      }
      
      fileList.sort((a, b) => a.createdDate - b.createdDate);
      fileList.forEach(entry => entry.file.setTrashed(true));
      return 0;
    } catch(err) {
      console.error(`"TrashOldTickets()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Get Drive ID from URL
   * @param {string} url
   * @return {string} id
   */
  static GetDriveIDFromUrl(url = ``) {
    let id = ``;
    const parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
    if (url.indexOf(`?id=`) >= 0){
      id = (parts[6].split(`=`)[1]).replace(`&usp`,``);
      return id;
    }
    id = parts[5].split(`/`);

    var sortArr = id.sort((a,b) => b.length - a.length);
    id = sortArr[0];
    return id;
  }

  /**
   * Download File
   */
  static DownloadFile(file) {
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















