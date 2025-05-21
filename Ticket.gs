
/**
 * -----------------------------------------------------------------------------------------------------------------
 * Ticket Class
 */
class TicketService {
  constructor(){
    
  }

  /**
   * Create Ticket
   */
  static async CreateTicket({
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
  }) {
    try {
      const folder = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(`TICKETGID`));
      const width = 260;
      const cost = weight ? TicketService.PrintCost(weight) : 0.0;

      // Check if doc exists
      if(TicketService.TicketExists(ticketName)) {
        console.info(`Deleting Found Ticket (${ticketName})`);
        const id = DriveController.GetFileByName(ticketName).getId();
        DriveController.DeleteFileByID(id);
      }

      let doc = DocumentApp.create(ticketName); // Make Document
      if (doc == undefined || doc == null || doc == NaN) throw new Error(`Could not create document.`);

      let body = doc.getBody();
      let docId = doc.getId();
      let url = doc.getUrl();
      
      const barcode = await BarcodeService.GenerateBarCodeForTicketHeader(jobID);

      // Append Document with Info
      body
        .setPageWidth(PAGESIZES.custom.width)
        .setPageHeight(PAGESIZES.custom.height)
        .setMarginTop(2)
        .setMarginBottom(2)
        .setMarginLeft(2)
        .setMarginRight(2);
      body.insertImage(0, barcode)
        .setWidth(width)
        .setHeight(100);
      body.insertHorizontalRule(1);
      body.insertParagraph(2, `Email: ${email.toString()}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 11,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });
      body.insertParagraph(3, `Printer: ${printerName.toString()}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING2)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 9,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });
      body.appendTable([
          [ `Name`, name, ],
          [ `Date Started`, submissiontime.toDateString(), ],
          [ `Design Specialist`, designspecialist, ],
          [ `Job ID`, jobID.toString(), ],
          [ `Student Email`, email.toString(), ],
          [ `Materials`, `PLA : ${weight} grams`, ],
          [ `Estimated Cost @ $0.04/gram`, `$${cost}`, ],
          [ `Filename`, `${filename}`, ],
        ])
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 6,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
          [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
        });

      image && body.insertImage(6, image)
        .setWidth(width)
        .setHeight(width);

      // Footer
      // doc
      //   .addFooter()
      //   .setAttributes({
      //     [DocumentApp.Attribute.FONT_SIZE]: 5,
      //     [DocumentApp.Attribute.LINE_SPACING]: 1,
      //     [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
      //     [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] : DocumentApp.HorizontalAlignment.CENTER,
      //   })
      //   .setText(Excuse());
      
      // Remove File from root and Add that file to a specific folder
      const docFile = DriveApp.getFileById(docId);
      docFile.moveTo(folder);
      docFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); // Set permissions to 'anyone can edit' for that file
        
      // Return Document to use later
      console.info(`DOC ----> ${doc?.getUrl()?.toString()}`)
      return doc;
    } catch(err) {
      console.error(`"CreateTicket()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Find Image blob from File
   * @param {png} file
   */
  static async GetImage(pngFile) {
    const url = `https://live3dprinteros.blob.core.windows.net/render/${pngFile}`;

    const params = {
      method : "GET",
      contentType : "image/png",
      followRedirects : true,
      muteHttpExceptions : true
    }

    try {
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      let blob = HtmlService.createHtmlOutput();
      if(responseCode == 404) return blob;
      else if(![200, 201].includes(responseCode)) {
        throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 
      }
      blob = response.getBlob().setName(`IMAGE_${pngFile}`);
      return blob;
    } catch(err) {
      console.error(`"GetImage()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Calculate PrintCost
   * @private
   * @param {number} weight
   * @return {number} value
   */
  static PrintCost(weight = 0.0) {
    return Number(weight * COSTMULTIPLIER).toFixed(2);
  }

  /**
   * Check if a Ticket Exists
   * @param {string} ticket name
   * @returns {bool} exists
   */
  static TicketExists(ticketName = ``) {
    const files = DriveController.GetFileByName(ticketName);
    return !!files;
  }

  static DeleteTicket(gid = ``) {
    DriveController.DeleteFileByID(gid);
  }

}

const _test_tickets = async () => {
  // const t = TicketService.TicketExists(`PrinterOSTicket-4068093`)
  // console.info(t)
  const dummyObj = {
      designspecialist : "Staff",
      submissiontime : new Date(),
      name : "Stu Dent",
      printerID : "123876",
      printerName : "Dingus",
      filename : "somefile.gcode",
      weight : 53.34,
    }
  let ticket = await TicketService.CreateTicket(dummyObj);
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Update All Missing Tickets
 */
class UpdateMissingTickets {
  constructor() {
    this.UpdateAllTickets();
  }

  /**
   * Update All Tickets
   */
  async UpdateAllTickets () {
    // this.UpdateSheetTickets(SHEETS.Crystallum);
    Object.values(SHEETS).forEach(async (sheet) => {
      await this.UpdateSheetTickets(sheet);
    });
  }

  /**
   * Update Sheet Tickets
   * @param {sheet} sheet
   */
  async UpdateSheetTickets(sheet) {
    let indexes = [];
    SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.ticket)
      .forEach( (item, index) => {
        if(!item) indexes.push(index + 2);
      })
    console.warn(`${sheet.getSheetName()} ---> Missing Tickets: ${indexes}`);
    indexes.forEach(async (index) => {
      this._UpdateRow(index, sheet);
    });
  }

  /**
   * Update Row 
   * @private
   * @param {number} row index
   * @param {sheet} sheet
   */
  async _UpdateRow(index, sheet) {
    const rowData = SheetService.GetRowData(sheet, index);
    let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, } = rowData;
    let imageBLOB = await TicketService.GetImage(picture);

    try {
      const t = await TicketService.CreateTicket({
        submissionTime : timestamp,
        email : email,
        printerName : printerName,
        printerID : printerID,
        weight : weight,
        jobID : jobID,
        filename : filename,
        image : imageBLOB, 
      });
      const url = t.getUrl();
      SheetService.SetByHeader(sheet, HEADERNAMES.ticket, index, url.toString());
      return 0;
    } catch (err) {
      console.error(`${err} : Couldn't generate a ticket....`);
      return 1;
    }
  }
}

/**
 * Main Entry Point
 * @TRIGGERED
 */
const MissingTicketUpdater = () => new UpdateMissingTickets();




// -----------------------------------------------------------------------------------------------------------------

/**
 * Fix Tickets for a Single Sheet
 */
const FixMissingTicketsForSingleSheet = (sheet) => {
  try {
    SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.ticket)
      .forEach( async (cell, index) => {
        if(!cell) {
          let thisRow = index + 2;
          console.warn(`Sheet : ${sheet.getSheetName()}, Index : ${thisRow} is Missing a Ticket! Creating new Ticket....`);
          const rowData = SheetService.GetRowData(sheet, thisRow);
          let { status, printerID, printerName, jobID, timestamp, email, posStatCode, duration, notes, picture, ticket, filename, weight, cost, } = rowData;
          
          let imageBLOB = await TicketService.GetImage(picture);

          const t = await TicketService.CreateTicket({
            submissionTime : timestamp,
            email : email,
            printerName : printerName,
            printerID : printerID,
            weight : weight,
            jobID : jobID,
            filename: filename,
            image : imageBLOB, 
          });
          const url = t.getUrl();
          SheetService.SetByHeader(sheet, HEADERNAMES.ticket, thisRow, url.toString());
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

