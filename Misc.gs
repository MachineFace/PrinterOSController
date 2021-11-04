/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
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
  let image;
  const repo = `https://live3dprinteros.blob.core.windows.net/render/${pngFile}`;

  const params = {
    "method" : "GET",
    contentType : "image/png",
    followRedirects : true,
    muteHttpExceptions : true
  };

  const html = await UrlFetchApp.fetch(repo, params);

  const responseCode = html.getResponseCode();
  Logger.log(`Response Code ---> : ${responseCode} : ${RESPONSECODES[responseCode]}`);

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
  Logger.log(JSON.stringify(res));
  return res;
}

/**
 * Search a Specific Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const SearchSpecificSheet = (sheet, value) => {
  if (value) value.toString().replace(/\s+/g, "");

  const finder = sheet.createTextFinder(value).findNext();
  if (finder != null) {
    return finder.getRow();
  } else return false;

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
        Logger.log(`Set Jobnumber to a new time because timestamp was missing.`);
      } else {
        jobnumber = +Utilities.formatDate(this.date, `PST`, `yyyyMMddhhmmss`);
        Logger.log(`Input time: ${this.date}, Set Jobnumber: ${jobnumber}`);
      }
    } catch (err) {
      Logger.log(`${err} : Couldnt fix jobnumber.`);
    }
    if (jobnumber == undefined || testedDate == false) {
      jobnumber = +Utilities.formatDate(new Date(), `PST`, `yyyyMMddHHmmss`);
    }
    Logger.log(`Returned Job Number: ${jobnumber}`);
    return jobnumber.toString();
  }
  
}


/**
 * Fix Statuses
 */
const FixStatus = () => {
  Logger.log(`Checking Statuses....`);
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
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 21:
          if (statuses[index + 2] != "In-Progress") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("In-Progress");
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 43:
          if (statuses[index + 2] != "FAILED") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("FAILED");
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 45:
          if (statuses[index + 2] != "Cancelled") {
            sheet.getRange(index + 2, 1, 1, 1).setValue("Cancelled");
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
      }
    });

  }
  Logger.log(`Statuses Checked and Fixed....`);
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
  const term = "berkdincer@berkeley.edu";
  const search = Search(term);
  Logger.log(`Search : ${search}`);
}

/**
 * Helper to make Sheets
 */
const _helperMakeSheets = async () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for(const [key, value] of Object.entries(PRINTERIDS)) {
    Logger.log(key);
    await ss.insertSheet().setName(key);
  }
}

const _testGetImage = async () => {
  let png = SHEETS.Spectrum.getRange(10, 13, 1, 1).getValue();
  let blob = await GetImage(png);
}

const _testFixStatus = async () => {
  Logger.log(`Testing fixing the Status....`);
  FixStatus();
  Logger.log(`Finished testing fixing the Status.`)
}









