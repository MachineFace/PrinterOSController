class Drive
{
  constructor() {
    this.root = DriveApp.getRootFolder();
    this.destination = DriveApp.getFoldersByName(`Job Tickets`);
    this.now = new Date();
    this.dateMinusOneTwenty = new Date(new Date().setDate(new Date().getDate() - 120));
    this.writer = new WriteLogger();
  }

  GetAllFileNamesInRoot() {
    let out = [];
    let files = this.root.getFiles();
    while (files.hasNext()) {
      let file = files.next();
      out.push(file);
    }
    // this.writer.Info(out);
    return out;
  }

  MoveTicketsOutOfRoot() {
    const files = this.GetAllFileNamesInRoot();
    const target = DriveApp.getFolderById(`1OJj0dxsa2Sf_tIBUnKm_BDmY7vFNMXYC`);
    this.writer.Info(`Destination ----> ${this.destination.next().getName()}, ID : `);
    files.forEach(file => {
      let name = file.getName();
      if(name == `Job Ticket` || name == `Job Ticket-[object Object]` || name == `PrinterOS Ticket`) {
        this.writer.Warning(`Moving ----> Name : ${name}, ID : ${file.getId()}`);
        file.moveTo(target);
        this.writer.Warning(`Moved ----> Name : ${name}, ID : ${file.getId()}`);
      } else {
        this.writer.Warning(`No files moved....`);
        return;
      }
    });
  }

  CountTickets() {
    let count = 0;
    let files = this.destination.next().getFiles();
    while (files.hasNext()) {
      count++;
    }
    this.writer.Info(`Total Tickets : ${count}`);
    return count;
  }

  TrashOldTickets() {
    let files = this.destination.next().getFiles();
    while (files.hasNext()) {
      let file = files.next();
      let date = file.getDateCreated();
      if(date < this.dateMinusOneTwenty) {
        this.writer.Warning(`Deleting ----> Name : ${file.getName()}, ID : ${file.getId()}, Date : ${file.getDateCreated()}`);
        file.setTrashed(true);
        this.writer.Warning(`Removed : ${file.getId()}`);
      } 
    }
  }
}

const CleanupDrive = () => {
  let d = new Drive();
  d.MoveTicketsOutOfRoot();
  d.TrashOldTickets();
  d.CountTickets();
}

const _testTick = () => {
  // let date = new Date();
  // let dateMinusNinety = new Date(new Date().setDate(date.getDate() - 90));
  // const fromDate = date.toISOString().split('T')[0];
  // const toDate = new Date().toISOString().split('T')[0];
  // Logger.log(`90 Days ago : ${dateMinusNinety}, Now : ${date}`);
  let d = new Drive();
  // d.CountTickets();
  d.TrashOldTickets();
}









