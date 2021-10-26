
/**
 * ----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class Ticket
{
  constructor({
    designspecialist = "Staff", 
    submissiontime = new Date(), 
    name = "Student Name", 
    email = "Student Email", 
    projectname = "Project Name", 
    material1Quantity = 0, 
    material2Quantity = 0,
    ticketName = "PrinterOS Ticket",
    printerID = "79165",
    printerName = "Spectrum",
    printDuration = 2000,
    jobID = 12934871,
    image,
  }){
    this.designspecialist = designspecialist;
    this.submissiontime = submissiontime;
    this.name = name;
    this.email = email;
    this.projectname = projectname;
    this.material1Quantity = material1Quantity;
    this.material2Quantity = material2Quantity;
    this.ticketName = ticketName;
    this.printerID = printerID;
    this.printerName = printerName;
    this.printDuration = printDuration;
    this.jobID = jobID;
    this.image = image;
  }

  _ReplaceTextToImage(body, searchText, image) {
    var next = body.findText(searchText);
    if (!next) return;
    var r = next.getElement();
    r.asText().setText("");
    var img = r.getParent().asParagraph().insertInlineImage(0, image);
    return next;
  };

  CreateTicket() {
    const jobnumber = this.jobID;
    const folder = DriveApp.getFoldersByName(`Job Tickets`); //Set the correct folder
    const doc = DocumentApp.create(this.ticketName); //Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    let url = doc.getUrl();
    
    const qGen = new QRCodeAndBarcodeGenerator({url, jobnumber});
    const barcode = qGen.GenerateBarCode();
    const qrCode = qGen.GenerateQRCode();

    // Append Document with Info
    if (doc != undefined || doc != null || doc != NaN) {
      let header = doc
        .addHeader()
        .appendTable([[`img1`, `img2`]])
        .setAttributes({
          [DocumentApp.Attribute.BORDER_WIDTH]: 0,
          [DocumentApp.Attribute.BORDER_COLOR]: `#ffffff`,
        });
      this._ReplaceTextToImage(header, `img1`, barcode);
      this._ReplaceTextToImage(header, `img2`, qrCode);

      body.insertHorizontalRule(0);
      body.insertParagraph(1, "Email: " + this.email.toString())
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 18,
          [DocumentApp.Attribute.BOLD]: true,
        });
      body.insertParagraph(2, "Printer: " + this.printerName.toString())
        .setHeading(DocumentApp.ParagraphHeading.HEADING2)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 12,
          [DocumentApp.Attribute.BOLD]: true,
        });

      // Create a two-dimensional array containing the cell contents.
      body.appendTable([
          ["Date Started", this.submissiontime.toString()],
          ["Design Specialist:", this.designspecialist],
          ["Job Number:", this.jobID.toString()],
          ["Student Email:", this.email.toString()],
          ["Elapsed time : ", this.printDuration.toString()],
          ["Materials:", `PLA : ${this.material1Quantity}`],
          ["Materials:", `Breakaway Support : ${this.material2Quantity}`],
        ])
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 9,
        });
      try {
        body.insertImage(5, this.image)
        .setWidth(350)
        .setHeight(350);
      } catch(err) {
        Logger.log(`${err} : Couldn't append the image to the ticket for some reason.`);
      }
      

      // Remove File from root and Add that file to a specific folder
      try {
        while(folder.hasNext()){
          const docFile = DriveApp.getFileById(docId);
          DriveApp.removeFile(docFile);
          folder.next().addFile(docFile);
          folder.next().addFile(barcode);
        }
      } catch (err) {
        Logger.log(`Whoops : ${err}`);
      }


      // Set permissions to 'anyone can edit' for that file
      let file = DriveApp.getFileById(docId);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
    }
    //Return Document to use later
    Logger.log(JSON.stringify(doc))
    return doc;
  };
}

/**
 * datetime=**, extruders=[**], id=**, print_time=**, gif_image=**, heated_bed_temperature=**, cost=**, raft=**, email=**, notes=**, material_type=**, filename=**.gcode, file_id=**,
 * picture=**.png, heated_bed=**, status_id=**, printing_duration=**, layer_height=**, file_size=**, printer_id=**, supports=**, weight=**
 */
const _testTicket = () => {
  let jobID;
  let info;
  let image;
  const pos = new PrinterOS();
  pos.Login()
  .then( async () => {
    const jobs = await pos.GetPrintersJobList(79165);
    jobID = jobs[0].id;
    Logger.log(jobID);
  })
  .then( async () => {
    info = await pos.GetJobInfo(jobID);
    image = await pos.imgBlob;
    Logger.log(info);
    Logger.log(image);
  })
  .then(() => {
    const dummyObj = {
      designspecialist : "Staff",
      submissiontime : new Date(),
      name : "Stu Dent",
      email : info.email,
      projectname : info.filename,
      material1Quantity : 5000,
      material2Quantity : 9000,
      printerID : "123876",
      printerName : "Dingus",
      printDuration : info.print_time,
      image : image,
    }
    Logger.log(dummyObj);

    const tic = new Ticket(dummyObj).CreateTicket();
    Logger.log(tic);
  })
  
  
}




/**
 * Check and Fix Missing Tickets
 */
const FixMissingTickets = () => {
  Logger.log(`Checking Tickets....`);
  for(const [key, sheet] of Object.entries(SHEETS)) {
    let ticketCells = sheet.getRange(2, 14, sheet.getLastRow() -1, 1).getValues();
    ticketCells = [].concat(...ticketCells);
    ticketCells.forEach( async (cell, index) => {
      if(!cell) {
        let thisRow = index + 2;
        Logger.log(`Sheet : ${sheet.getSheetName()}, Index : ${thisRow} is Missing a Ticket! Creating new Ticket....`);

        const printerID = sheet.getRange(thisRow, 2).getValue();
        const printerName = sheet.getRange(thisRow, 3).getValue();
        const jobID = sheet.getRange(thisRow, 4).getValue();
        const timestamp = sheet.getRange(thisRow, 5).getValue();
        const email = sheet.getRange(thisRow, 6).getValue();
        const status = sheet.getRange(thisRow, 7).getValue();
        const duration = sheet.getRange(thisRow, 8).getValue();
        const elapsed = sheet.getRange(thisRow, 10).getValue();
        const materials = sheet.getRange(thisRow, 11).getValue();
        const cost = sheet.getRange(thisRow, 12).getValue();
        const picture = sheet.getRange(thisRow, 13).getValue();
        
        let imageBLOB = await GetImage(picture);

        const ticket = await new Ticket({
          submissionTime : timestamp,
          email : email,
          printerName : printerName,
          printerID : printerID,
          printDuration : duration,
          material1Quantity : materials,
          jobID : jobID,
          image : imageBLOB, 
        }).CreateTicket();
        const url = ticket.getUrl();
        sheet.getRange(thisRow, 14).setValue(url.toString());
        Logger.log(`Ticket Created....`);
      }
    });
  }
  Logger.log(`Tickets Checked and Fixed....`);

}

