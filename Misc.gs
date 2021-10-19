/**
 * MISC
 * ----------------------------------------------------------------------------------------------------------------
 */


/**
 * Get Drive ID from URL
 */
const GetDriveIDFromUrl = (url) => { 
  let id = "";
  const parts = url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
  if (url.indexOf('?id=') >= 0){
    id = (parts[6].split("=")[1]).replace("&usp","");
    return id;
  } else {
    id = parts[5].split("/");
    // Using sort to get the id as it is the longest element. 
    var sortArr = id.sort(function(a,b){return b.length - a.length});
    id = sortArr[0];
    return id;
  }
}

/**
 * Find Image blob from File
 */
const GetImage = async (pngFile) => {
  const writer = new WriteLogger();
  let image;
  writer.Info(`IMAGE ----> ${pngFile}`);
  const repo = `https://live3dprinteros.blob.core.windows.net/render/${pngFile}`;

  const params = {
    "method" : "GET",
    contentType : "image/png",
    followRedirects : true,
    muteHttpExceptions : true
  };

  const html = await UrlFetchApp.fetch(repo, params);

  const responseCode = html.getResponseCode();
  writer.Debug(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

  if(responseCode == 200) {
    const folder = DriveApp.getFoldersByName(`Job Tickets`);
    const blob = html.getBlob().setName(`IMAGE_${pngFile}`);
    return blob;
  } else return false;
}


/**
 * Search all Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const Search = (value) => {
  const writer = new WriteLogger();
  if (value) value.toString().replace(/\s+/g, "");
  let res = {};
  for(const [key, sheet] of Object.entries(SHEETS)) {
    const finder = sheet.createTextFinder(value).findAll();
    if (finder != null) {
      temp = [];
      finder.forEach(result => temp.push(result.getRow()));
      res[sheet.getName()] = temp;
    }
  }
  writer.Debug(JSON.stringify(res));
  return res;
}



/**
 * ----------------------------------------------------------------------------------------------------------------
 * Generate new Job number from a date
 * @param {time} date
 * @return {number} job number
 */
class JobNumberGenerator {
  constructor ({
    date = new Date(),
  }) {
    this.date = date;
    this.writer = new WriteLogger();
  }

  TestDate() {
    if (Object.prototype.toString.call(this.date) !== "[object Date]") return false;
    return !isNaN(this.date.getTime());
  }

  GenerateJobNumber() { 
    const testedDate = this.TestDate(this.date);

    let jobnumber;
    try {
      if ( this.date == undefined || this.date == null || this.date == "" || testedDate == false ) {
        jobnumber = +Utilities.formatDate(new Date(), `PST`, `yyyyMMddHHmmss`);
        this.writer.Warning(`Set Jobnumber to a new time because timestamp was missing.`);
      } else {
        jobnumber = +Utilities.formatDate(this.date, `PST`, `yyyyMMddhhmmss`);
        this.writer.Info(`Input time: ${this.date}, Set Jobnumber: ${jobnumber}`);
      }
    } catch (err) {
      this.writer.Error(`${err} : Couldnt fix jobnumber.`);
    }
    if (jobnumber == undefined || testedDate == false) {
      jobnumber = +Utilities.formatDate(new Date(), `PST`, `yyyyMMddHHmmss`);
    }
    this.writer.Info(`Returned Job Number: ${jobnumber}`);
    return jobnumber.toString();
  }
  
}


/**
 * Fix Statuses
 */
const FixStatus = () => {
  const writer = new WriteLogger();
  writer.Info(`Checking Statuses....`);
  for(const [key, sheet] of Object.entries(SHEETS)) {
    let posCodes = sheet.getRange(2, 7, sheet.getLastRow() -1, 1).getValues();
    posCodes = [].concat(...posCodes);
    let statuses = sheet.getRange(2, 1, sheet.getLastRow() -1, 1).getValues();
    statuses = [].concat(...statuses);
    posCodes.forEach( (code, index) => {
      switch(code) {
        case 11:
          if (statuses[index + 2] != "Queued") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("Queued");
            writer.Info(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 21:
          if (statuses[index + 2] != "In-Progress") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("In-Progress");
            writer.Info(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 43:
          if (statuses[index + 2] != "FAILED") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("FAILED");
            writer.Info(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 45:
          if (statuses[index + 2] != "Cancelled") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("Cancelled");
            writer.Info(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
      }
    });

  }
  writer.Info(`Statuses Checked and Fixed....`);
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Test if value is a date and return true or false
 * @param {date} d
 * @returns {boolean} b
 */
const IsValidDate = (d) => {
  if (Object.prototype.toString.call(d) !== "[object Date]") return false;
  return !isNaN(d.getTime());
};


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Unit test for JobNumber
 */
const _testJob = () => {
  const now = new Date();
  // const jnum = new JobNumberGenerator({date : now}).GenerateJobNumber();
  const jnum = new JobNumberGenerator({}).GenerateJobNumber();
  Logger.log(jnum)
}

/**
 * Unit test for Search
 */
const _testSearch = () => {
  const writer = new WriteLogger();
  const term = "berkdincer@berkeley.edu";
  const search = Search(term);
  writer.Debug(`Search : ${search}`);
}

/**
 * Helper to make Sheets
 */
const _helperMakeSheets = async () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for(const [key, value] of Object.entries(hardIDs)) {
    Logger.log(key);
    await ss.insertSheet().setName(key);
  }
}

const _testGetImage = async () => {
  let png = SHEETS.Spectrum.getRange(10, 13, 1, 1).getValue();
  let blob = await GetImage(png);
}

const _testFixStatus = async () => {
  const writer = new WriteLogger();
  writer.Info(`Testing fixing the Status....`);
  FixStatus();
  writer.Info(`Finished testing fixing the Status.`)
}









