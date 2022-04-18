
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class Ticket
{
  constructor({
    designspecialist : designspecialist, 
    submissiontime : submissiontime, 
    name : name, 
    email : email, 
    projectname : projectname, 
    material1Quantity : material1Quantity, 
    material2Quantity : material2Quantity,
    ticketName : ticketName,
    printerID : printerID,
    printerName : printerName,
    printDuration : printDuration,
    jobID : jobID,
    filename : filename,
    image : image,
  }){
    this.designspecialist = designspecialist ? designspecialist : `Staff`;
    this.submissiontime = submissiontime ? submissiontime : new Date();
    this.name = name ? name : `Student Name`;
    this.email = email ? email : `Student Email`;
    this.projectname = projectname ? projectname : `Project Name`;
    this.material1Quantity = material1Quantity ? material1Quantity : 0;
    this.material2Quantity = material2Quantity ? material2Quantity : 0;
    this.ticketName = ticketName ? ticketName : `PrinterOS Ticket`;
    this.printerID = printerID ? printerID : `79165`;
    this.printerName = printerName ? printerName : `Spectrum`;
    this.printDuration = printDuration ? printDuration : 2000;
    this.jobID = jobID ? jobID : 12934871;
    this.filename = filename ? filename : `file.gcode`;
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
    const folder = DriveApp.getFoldersByName(`Job Tickets`); // Set the correct folder
    const doc = DocumentApp.create(this.ticketName); // Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    let url = doc.getUrl();
    
    const qGen = new QRCodeAndBarcodeGenerator({url, jobnumber});
    const barcode = qGen.GenerateBarCodeForTicketHeader();

    // Append Document with Info
    if (doc != undefined || doc != null || doc != NaN) {

      body
        .setPageWidth(PAGESIZES.custom.width)
        .setPageHeight(PAGESIZES.custom.height)
        .setMarginTop(2)
        .setMarginBottom(2)
        .setMarginLeft(2)
        .setMarginRight(2);

      body.insertImage(0, barcode)
        .setWidth(260)
        .setHeight(100);
      body.insertHorizontalRule(1);

      body.insertParagraph(2, "Email: " + this.email.toString())
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 13,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });
      body.insertParagraph(3, "Printer: " + this.printerName.toString())
        .setHeading(DocumentApp.ParagraphHeading.HEADING2)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 9,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });

      // Create a two-dimensional array containing the cell contents.
      body.appendTable([
          ["Date Started", this.submissiontime.toString()],
          ["Design Specialist:", this.designspecialist],
          ["Job Number:", this.jobID.toString()],
          ["Student Email:", this.email.toString()],
          ["Elapsed time : ", this.printDuration.toString()],
          ["Materials:", `PLA : ${this.material1Quantity + this.material2Quantity}`],
          ["Filename:", `${this.filename}`],
        ])
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 6,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
          [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
        });
      try {
        body.insertImage(6, this.image)
        .setWidth(260)
        .setHeight(260);
      } catch(err) {
        console.error(`${err} : Couldn't append the image to the ticket for some reason.`);
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
        console.error(`Whoops : ${err}`);
      }


      // Set permissions to 'anyone can edit' for that file
      let file = DriveApp.getFileById(docId);
      file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
    }
    // Return Document to use later
    console.info(`DOC ----> ${doc?.getUrl()?.toString()}`)
    return doc;
  };
}

/**
 * -----------------------------------------------------------------------------------------------------------------
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
    console.info(jobID);
  })
  .then( async () => {
    info = await pos.GetJobInfo(jobID);
    image = await pos.imgBlob;
    console.info(info);
    console.info(image);
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
      filename : "somefile.gcode",
      image : image,
    }
    new Ticket(dummyObj).CreateTicket();
  })
  
  
}




/**
 * -----------------------------------------------------------------------------------------------------------------
 * Check and Fix Missing Tickets
 */
const FixMissingTickets = () => {
  console.info(`Checking Tickets....`);
  for(const [key, sheet] of Object.entries(SHEETS)) {
    let ticketCells = sheet.getRange(2, 14, sheet.getLastRow() -1, 1).getValues();
    ticketCells = [].concat(...ticketCells);
    ticketCells.forEach( async (cell, index) => {
      if(!cell) {
        let thisRow = index + 2;
        console.warn(`Sheet : ${sheet.getSheetName()}, Index : ${thisRow} is Missing a Ticket! Creating new Ticket....`);
        
        const printerID = GetByHeader(sheet, "PrinterID", thisRow);
        const printerName = GetByHeader(sheet, "PrinterName", thisRow);
        const jobID = GetByHeader(sheet, "JobID", thisRow);
        const timestamp = GetByHeader(sheet, "Timestamp", thisRow);
        const email = GetByHeader(sheet, "Email", thisRow);
        const status = GetByHeader(sheet, "POS Stat Code", thisRow);
        const duration = GetByHeader(sheet, "Duration (Hours)", thisRow);
        const elapsed = GetByHeader(sheet, "Elapsed", thisRow);
        const materials = GetByHeader(sheet, "Materials", thisRow);
        const cost = GetByHeader(sheet, "Cost", thisRow);
        const filename = GetByHeader(sheet, "Filename", thisRow);
        const picture = GetByHeader(sheet, "Picture", thisRow);
        
        let imageBLOB = await GetImage(picture);

        const ticket = await new Ticket({
          submissionTime : timestamp,
          email : email,
          printerName : printerName,
          printerID : printerID,
          printDuration : duration,
          material1Quantity : materials,
          jobID : jobID,
          filename: filename,
          image : imageBLOB, 
        }).CreateTicket();
        const url = ticket.getUrl();
        sheet.getRange(thisRow, 14).setValue(url.toString());
        console.warn(`Ticket Created....`);
      }
    });
  }
  console.info(`Tickets Checked and Fixed....`);

}

