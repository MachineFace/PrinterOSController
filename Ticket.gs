
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class Ticket
{
  constructor({
    designspecialist : designspecialist = `Staff`, 
    submissiontime : submissiontime = new Date(), 
    name : name = `Student Name`, 
    email : email = `Student Email`, 
    projectname : projectname = `Project Name`, 
    weight : weight = 0.0, 
    printerID : printerID = `79165`,
    printerName : printerName = `Spectrum`,
    jobID : jobID = 12934871,
    ticketName : ticketName = `PrinterOSTicket-${jobID}`,
    filename : filename = `file.gcode`,
    image : image,
  }){
    this.designspecialist = designspecialist;
    this.submissiontime = submissiontime;
    this.name = name;
    this.email = email;
    this.projectname = projectname;
    this.weight = weight;
    this.cost = weight ? PrintCost(weight) : 0.0;
    this.jobID = jobID;
    this.ticketName = ticketName;
    this.printerID = printerID;
    this.printerName = printerName;
    this.filename = filename;
    this.image = image;
    this.folder = DriveApp.getFolderById(TICKETGID);
  }

  CreateTicket() {
    const jobnumber = this.jobID;
    let doc = DocumentApp.create(this.ticketName); // Make Document
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
          ["Materials:", `PLA : ${this.weight} grams`],
          [`Estimated Cost @ $0.04/gram:`, `$${this.cost}`],
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
        const docFile = DriveApp.getFileById(docId);
        docFile.moveTo(this.folder);
        barcode.moveTo(this.folder);
        // Set permissions to 'anyone can edit' for that file
        docFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //set sharing
      } catch (err) {
        console.error(`Whoops : ${err}`);
      }
      
    }
    // Return Document to use later
    console.info(`DOC ----> ${doc?.getUrl()?.toString()}`)
    return doc;
  };
}




/**
 * Fix Tickets for a Single Sheet
 */
const FixMissingTicketsForSingleSheet = (sheet) => {
  let ticketCells = GetColumnDataByHeader(sheet, HEADERNAMES.ticket);
  ticketCells.forEach( async (cell, index) => {
    if(!cell) {
      let thisRow = index + 2;
      console.warn(`Sheet : ${sheet.getSheetName()}, Index : ${thisRow} is Missing a Ticket! Creating new Ticket....`);
      const rowData = GetRowData(sheet, thisRow);
      let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, } = rowData;
      
      let imageBLOB = await GetImage(picture);

      const t = await new Ticket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printerID,
        weight : weight,
        jobID : jobID,
        filename: filename,
        image : imageBLOB, 
      }).CreateTicket();
      const url = t.getUrl();
      SetByHeader(sheet, HEADERNAMES.ticket, thisRow, url.toString());
      console.warn(`Ticket Created....`);
    }
  });
  return 0;
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Check and Fix Missing Tickets
 */
const FixMissingTickets = () => {
  console.info(`Checking Tickets....`);
  Object.values(SHEETS).forEach(sheet => {
    FixMissingTicketsForSingleSheet(sheet);
  });
  console.info(`Tickets Checked and Fixed....`);
  return 0;
}

