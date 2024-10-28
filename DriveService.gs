/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Working with Google Drive
 * @TRIGGERED once a week
 */
class DriveController {
  constructor() {
    
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
  static MoveTicketsOutOfRoot() {
    try {
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      const files = DriveController.AllFileNamesInRoot;
      console.info(`Destination ----> ${ticketFolder.getName()}`);
      files.forEach(file => {
        let name = file.getName();
        if(name.includes(`Job Ticket`) || name.includes(`Job Ticket-[object Object]`) || name.includes(`PrinterOS Ticket`) || name.includes(`Job Ticket-`) || name.includes(`PrinterOSTicket`)) {
          console.warn(`Moving ----> Name : ${name}, ID : ${file.getId()}`);
          file.moveTo(ticketFolder);
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
  static CountTickets() {
    try {
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      let count = 0;
      let files = ticketFolder.getFiles();
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
  static TrashOldTickets() {
    try {
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      const date120DaysAgo = new Date(new Date().setDate(new Date().getDate() - 120));
      console.warn(`DELETING TICKETS OLDER THAN 120 Days ago ---> ${date120DaysAgo}`);
      const files = ticketFolder.getFiles();
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

  /**
   * Search for File
   * @param {string} filename
   * @returns {file} file
   */
  static GetFileByName(fileName = ``) {
    try {
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      const files = ticketFolder.getFilesByName(fileName);
      if (files.hasNext()) {
        const file = files.next();
        console.info(`File found: ${file.getName()} (ID: ${file.getId()})`);
        return file;
      } else {
        console.warn(`No file found with the specified name.`);
        return null;
      }
    } catch(err) {
      console.error(`"GetFileByName()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Get File by ID
   * @param {string} google id
   * @returns {file} file
   */
  static GetFileByID(id = ``) {
    try {
      return DriveApp.getFileById(id);
    } catch(err) {
      console.error(`"GetFileByID()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Delete File by ID
   * @param {string} id
   * @returns {bool} success
   */
  static DeleteFileByID(id = ``) {
    try {
      DriveApp.getFileById(id)
        .setTrashed(true);
      return 0;
    } catch(err) {
      console.error(`"DeleteFileByID()" failed: ${err}`);
      return 1;
    }
  }
  
}

/**
 * -----------------------------------------------------------------------------------------------------------------
 * Main Cleanup Function
 */
const CleanupDrive = () => DriveController.MoveTicketsOutOfRoot();
const TrashOldTickets = () => DriveController.TrashOldTickets();
const CountTickets = () => DriveController.CountTickets();















