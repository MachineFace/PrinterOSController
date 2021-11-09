/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
 */


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetByHeader = (sheet, columnName, row) => {
  try {
    let data = sheet.getDataRange().getValues();
    let col = data[0].indexOf(columnName);
    if (col != -1) return data[row - 1][col];
  } catch (err) {
    Logger.log(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName} Row: ${row}`);
  }
};


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return the values of a column by the name
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetColumnDataByHeader = (sheet, columnName) => {
  try {
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName);
    let colData = data.map(d => d[col]);
    colData.splice(0, 1);
    if (col != -1) return colData;
  } catch (err) {
    Logger.log(`${err} : GetByHeader failed - Sheet: ${sheet} Col Name specified: ${columnName}`);
  }
};



/**
 * ----------------------------------------------------------------------------------------------------------------
 * Set the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 * @param {any} val
 */
const SetByHeader = (sheet, columnName, row, val) => {
  try {
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName) + 1;
    sheet.getRange(row, col).setValue(val);
  } catch (err) {
    Logger.log(`${err} : setByHeader failed - Sheet: ${sheet} Row: ${row} Col: ${col} Value: ${val}`);
  }
};


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
    
    let posCodes = GetColumnDataByHeader(sheet, "POS Stat Code");
    let statuses = GetColumnDataByHeader(sheet, "Status");
    posCodes.forEach( (code, index) => {
      switch(code) {
        case 11:
          if (statuses[index + 2] != STATUS.queued) {
            SetByHeader(sheet, "Status", index + 2, STATUS.queued);
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 21:
          if (statuses[index + 2] != STATUS.inProgress) {
            SetByHeader(sheet, "Status", index + 2, STATUS.inProgress);
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 43:
          if (statuses[index + 2] != STATUS.failed) {
            SetByHeader(sheet, "Status", index + 2, STATUS.failed);
            Logger.log(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
          }
          break;
        case 45:
          if (statuses[index + 2] != STATUS.cancelled) {
            SetByHeader(sheet, "Status", index + 2, STATUS.cancelled);
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
  let png = GetByHeader(SHEETS.Spectrum, "Picture", 10);
  Logger.log(png)
  let blob = await GetImage(png);
}

const _testFixStatus = async () => {
  Logger.log(`Testing fixing the Status....`);
  FixStatus();
  Logger.log(`Finished testing fixing the Status.`)
}


const _testGetHead = () => {
  let d = GetColumnDataByHeader(SHEETS.Spectrum, "JobID");
  Logger.log(d)
}








