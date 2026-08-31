
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
      return null;
    }
  }

  /**
   * Normalize and validate ticket input.
   * @param {Object} options
   * @return {Object}
   */
  static NormalizeTicketData(options = {}) {
    try {
      if(!options || typeof options !== `object` || Array.isArray(options)) {
        throw new TypeError(`Ticket options must be an object.`);
      }

      let {
        designspecialist = `Staff`,
        submissiontime = new Date(),
        name = `Student Name`,
        email = `Student Email`,
        projectname = `Project Name`,
        weight = 0,
        printerID = `79165`,
        printerName = `Spectrum`,
        jobID = 12934871,
        ticketName,
        filename = `file.gcode`,
        image = null,
      } = options;

      if(!(submissiontime instanceof Date)) {
        submissiontime = new Date(submissiontime);
      }

      if(isNaN(submissiontime.getTime())) {
        throw new TypeError(`Invalid submissiontime.`);
      }

      weight = Number(weight);

      if(!Number.isFinite(weight) || weight < 0) {
        throw new TypeError(`Weight must be a finite number >= 0.`);
      }

      if(jobID === null || jobID === undefined || `${jobID}`.trim() === ``) {
        throw new TypeError(`Job ID is required.`);
      }

      jobID = String(jobID).trim();

      printerID = String(printerID ?? ``).trim();
      printerName = String(printerName ?? ``).trim();
      designspecialist = String(designspecialist ?? ``).trim();
      name = String(name ?? ``).trim();
      email = String(email ?? ``).trim();
      projectname = String(projectname ?? ``).trim();
      filename = String(filename ?? ``).trim();

      ticketName = String(
        ticketName || `PrinterOSTicket-${jobID}`
      ).trim();

      if(!ticketName) {
        throw new TypeError(`Ticket name is required.`);
      }

      return {
        designspecialist,
        submissiontime,
        name,
        email,
        projectname,
        weight,
        printerID,
        printerName,
        jobID,
        ticketName,
        filename,
        image,
      }

    } catch(err) {
      console.error(`"NormalizeTicketData()" failed: ${err}`);
      return null;
    }
  }

  /**
   * Populate a ticket document.
   *
   * @param {GoogleAppsScript.Document.Document} doc
   * @param {Object} ticket
   */
  static async PopulateDocument(doc, ticket) {
    try {
      // Validate
      if(!doc) throw new Error(`Document is required.`);
      if(!ticket) throw new Error(`Ticket data is required.`);

      const body = doc.getBody();
      const width = 260;
      const cost = TicketService.PrintCost(ticket.weight);

      body
        .setPageWidth(PAGESIZES.custom.width)
        .setPageHeight(PAGESIZES.custom.height)
        .setMarginTop(2)
        .setMarginBottom(2)
        .setMarginLeft(2)
        .setMarginRight(2);

      const barcode = await BarcodeService.GenerateBarCodeForTicketHeader(ticket.jobID);
      if(!barcode) throw new Error(`Barcode generation failed.`);

      body
        .appendImage(barcode)
        .setWidth(width)
        .setHeight(100);

      body.appendHorizontalRule();

      body
        .appendParagraph(`Email: ${ticket.email}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING1)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 11,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });

      body
        .appendParagraph(`Printer: ${ticket.printerName}`)
        .setHeading(DocumentApp.ParagraphHeading.HEADING2)
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 9,
          [DocumentApp.Attribute.BOLD]: true,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
        });

      body
        .appendTable([
          [`Name`, ticket.name],
          [`Date Started`, ticket.submissiontime.toDateString()],
          [`Design Specialist`, ticket.designspecialist],
          [`Job ID`, ticket.jobID],
          [`Student Email`, ticket.email],
          [`Materials`, `PLA : ${ticket.weight} grams`],
          [`Estimated Cost @ $0.04/gram`, `$${cost}`],
          [`Filename`, ticket.filename],
        ])
        .setAttributes({
          [DocumentApp.Attribute.FONT_SIZE]: 6,
          [DocumentApp.Attribute.LINE_SPACING]: 1,
          [DocumentApp.Attribute.BORDER_WIDTH]: 0.5,
        });

      if(ticket.image) {
        body
          .appendImage(ticket.image)
          .setWidth(width)
          .setHeight(width);
      }

      return doc;

    } catch(err) {
      console.error(`"PopulateDocument()" failed: ${err}`);
      return null;
    }
  }

  /**
   * Delete an existing ticket if one exists.
   * @param {string} ticketName
   * @return {boolean}
   */
  static DeleteExistingTicket(ticketName = ``) {
    try {
      if(!ticketName) return false;

      const file = DriveController.GetFileByName(ticketName);
      if(!file) return false;

      const fileID = file.getId();
      if(!fileID) {
        throw new Error(`Existing ticket has no file ID.`);
      }

      DriveController.DeleteFileByID(fileID);
      console.info(`Deleted existing ticket: ${ticketName}`);

      return true;

    } catch(err) {
      console.error(`"DeleteExistingTicket()" failed: ${err}`);
      return false;
    }
  }

  /**
   * Delete a ticket by Drive file ID.
   *
   * @param {string} gid
   * @return {boolean}
   */
  static DeleteTicket(gid = ``) {
    try {
      gid = String(gid).trim();

      if(!gid) return false;

      DriveController.DeleteFileByID(gid);
      return true;

    } catch(err) {
      console.error(`"DeleteTicket()" failed: ${err}`);
      return false;
    }
  }


  /**
   * Check whether a ticket exists.
   * @param {string} ticketName
   * @return {boolean}
   */
  static TicketExists(ticketName = ``) {
    try {
      ticketName = String(ticketName).trim();

      if(!ticketName) return false;
      return !!DriveController.GetFileByName(ticketName);

    } catch(err) {
      console.error(`"TicketExists()" failed: ${err}`);
      return null;
    }
  }

  /**
   * Fetch an image blob from PrinterOS.
   *
   * @param {string} pngFile
   * @return {GoogleAppsScript.Base.Blob|null}
   */
  static async GetImage(pngFile = ``) {
    try {
      pngFile = String(pngFile).trim();
      if(!pngFile) throw new TypeError(`Image filename is required.`);

      const url = `https://live3dprinteros.blob.core.windows.net/render/${encodeURIComponent(pngFile)}`;

      const response = await UrlFetchApp.fetch(url, {
        method: `get`,
        followRedirects: true,
        muteHttpExceptions: true,
      });

      const responseCode = response.getResponseCode();
      if(responseCode === 404) {
        console.warn(`Image not found: ${pngFile}, ${responseCode} ---> ${RESPONSECODES[responseCode]}`);
        return null;
      }

      if(responseCode !== 200) {
        throw new Error(`Image request failed with HTTP ${responseCode} ---> ${RESPONSECODES[responseCode]}.`);
      }

      const blob = response.getBlob();

      if(!blob) {
        throw new Error(`Image response contained no blob.`);
      }

      return blob.setName(`IMAGE_${pngFile}`);

    } catch(err) {
      console.error(`"GetImage()" failed: ${err}`);
      return null;
    }
  }

  /**
   * Calculate print cost.
   * @param {number} weight
   * @return {string|null}
   */
  static PrintCost(weight = 0) {
    try {
      weight = Number(weight);
      if(!Number.isFinite(weight) || weight < 0) {
        throw new TypeError(`Weight must be a finite number >= 0.`);
      }

      return (weight * COSTMULTIPLIER).toFixed(2);

    } catch(err) {
      console.error(`"PrintCost()" failed: ${err}`);
      return null;
    }
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
      return null;
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
    return null;
  }
}


/**
 * Check and Fix Missing Tickets
 */
const FixMissingTickets = () => {
  try {
    console.info(`Skipping ticket creation...`);
    // console.info(`Checking Tickets....`);
    // Object.values(SHEETS).forEach(sheet => {
    //   FixMissingTicketsForSingleSheet(sheet);
    // });
    // console.info(`Tickets Checked and Fixed....`);
    return 0;
  } catch(err) {
    console.error(`"FixMissingTickets()" failed : ${err}`);
    return null;
  }
}

