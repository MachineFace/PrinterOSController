
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class Ticket {
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
    /** @private */
    this.designspecialist = designspecialist;
    /** @private */
    this.submissiontime = submissiontime;
    /** @private */
    this.name = name;
    /** @private */
    this.email = email;
    /** @private */
    this.projectname = projectname;
    /** @private */
    this.weight = weight;
    /** @private */
    this.cost = weight ? this._PrintCost(weight) : 0.0;
    /** @private */
    this.jobID = jobID;
    /** @private */
    this.ticketName = ticketName;
    /** @private */
    this.printerID = printerID;
    /** @private */
    this.printerName = printerName;
    /** @private */
    this.filename = filename;
    /** @private */
    this.image = image;
    /** @private */
    this.folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKETGID`));
  }

  /**
   * Create Ticket
   */
  CreateTicket() {
    const jobnumber = this.jobID;
    let doc = DocumentApp.create(this.ticketName); // Make Document
    let body = doc.getBody();
    let docId = doc.getId();
    let url = doc.getUrl();
    
    const b = new BarcodeService({jobnumber});
    const barcode = b.GenerateBarCodeForTicketHeader();

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
          [DocumentApp.Attribute.FONT_SIZE]: 11,
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
          ["Date Started", this.submissiontime.toDateString()],
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

  /**
   * Calculate PrintCost
   * @private
   * @param {number} weight
   * @return {number} value
   */
  _PrintCost(weight = 0.0) {
    return Number(weight * COSTMULTIPLIER).toFixed(2);
  }
}




/**
 * Fix Tickets for a Single Sheet
 */
const FixMissingTicketsForSingleSheet = (sheet) => {
  try {
    GetColumnDataByHeader(sheet, HEADERNAMES.ticket)
      .forEach( async (cell, index) => {
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
  } catch(err) {
    console.error(`"FixMissingTicketsForSingleSheet()" failed : ${err}`);
    return 1;
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Check and Fix Missing Tickets
 */
const FixMissingTickets = () => {
  try {
    console.info(`Checking Tickets....`);
    Object.values(SHEETS).forEach(sheet => {
      FixMissingTicketsForSingleSheet(sheet);
    });
    console.info(`Tickets Checked and Fixed....`);
    return 0;
  } catch(err) {
    console.error(`"FixMissingTickets()" failed : ${err}`);
    return 1;
  }
}

