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
   * Delete Old Tickets
   * ** Note: this function needed a timeout. Otherwise it runs forever
   */
  static DeleteOldTickets() {
    try {
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      const dateminus90 = new Date(new Date().setDate(new Date().getDate() - 90));
      console.warn(`DELETING TICKETS OLDER THAN 120 Days ago ---> ${dateminus90}`);
      const files = ticketFolder.getFiles();
      const startTime = new Date().getTime();
      const timeout = 5.9 * 60 * 1000;
      while (files.hasNext() && (new Date().getTime() - startTime < timeout)) {
        let file = files.next();
        let date = file.getDateCreated();
        if(date > dateminus90) continue;
        let fileName = file.getName(), id = file.getId();
        let tag = `File: ${fileName}, ID: ${id}, Date: ${date}`;
        file.setTrashed(true);
        console.warn(`DELETED: (${tag})`);
        if(!file.isTrashed()) throw new Error(`Whoops: Couldn't delete (${tag})`);
      } 
      return 0;
    } catch(err) {
      console.error(`"DeleteOldTickets()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Trash Old Tickets
   */
  static DeleteOldestTicketsFirst() {
    try {
      const dateminus90 = new Date(new Date().setDate(new Date().getDate() - 90));
      console.warn(`DELETING TICKETS OLDER THAN 120 Days ago ---> ${dateminus90}`);
      const ticketFolder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
      const files = ticketFolder.getFiles();
    
      let fileList = [];
      while (files.hasNext()) {
        let file = files.next();
        if(file.getDateCreated() > dateminus90) continue;
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
   * Delete Duplicate Files
   */
  static DeleteDuplicateFiles() {
    const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKET_FOLDER_GID`));
    const files = folder.getFiles();

    let fileMap = {};

    // Group files by name
    const startTime = new Date().getTime();
    const timeout = 5.9 * 60 * 1000;
    while (files.hasNext() && (new Date().getTime() - startTime < timeout)) {
      let file = files.next();
      let fileName = file.getName();

      // If a duplicate exists and it's newer, delete the current file
      if (fileMap[fileName] && fileMap[fileName].getLastUpdated() > file.getLastUpdated()) {
        file.setTrashed(true);
      } else {
        // Otherwise, keep this file and trash the older one if it exists
        if (fileMap[fileName]) {
          fileMap[fileName].setTrashed(true);
        }
        fileMap[fileName] = file;
      }
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
      if (!files.hasNext()) {
        console.warn(`No file found with the specified name.`);
        return null;
      }
      const file = files.next();
      console.info(`File found: ${file.getName()} (ID: ${file.getId()})`);
      return file;
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
const TrashOldTickets = () => DriveController.DeleteOldTickets();
const CountTickets = () => DriveController.CountTickets();



const _test_DriveController = () => {
  DriveController.DeleteDuplicateFiles();
}











