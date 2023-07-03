/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
 */


/**
 * Return the value of a cell by column name and row number
 * @param {sheet} sheet
 * @param {string} colName
 * @param {number} row
 */
const GetByHeader = (sheet, columnName, row) => {
  try {
    if(typeof(sheet) !== typeof(SHEETS.Spectrum)) throw new Error(`Bad sheet supplied: Sheet: ${sheet}, Col: ${columnName}, Row: ${row}`);
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(columnName);
    if (col != -1) return data[row - 1][col];
  } catch(err) {
    console.error(`"GetByHeader()" failed : ${err}`);
    return 1;
  }
};


/**
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
    console.error(`"GetColumnDataByHeader()" failed : ${err}`);
    return 1;
  }
};


/**
 * Return the values of a row by the number
 * @param {sheet} sheet
 * @param {number} row
 * @returns {dict} {header, value}
 */
const GetRowData = (sheet, row) => {
  let dict = {};
  try {
    let headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (name, index) => {
      headers[index] = Object.keys(HEADERNAMES).find(key => HEADERNAMES[key] === name);
    })
    let data = sheet.getRange(row, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (header, index) => {
      dict[header] = data[index];
    });
    dict[`sheetName`] = sheet.getSheetName();
    dict[`row`] = row;
    console.info(dict);
    return dict;
  } catch (err) {
    console.error(`"GetRowData()" failed : ${err}`);
    return 1;
  }
}

/**
 * Set Row Data
 * @param {sheet} sheet
 * @param {object} rowdata to write
 * @return {number} success or failure
 */
const SetRowData = (sheet, data) => {
  try {
    let sorted = [];
    const headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
    headers.forEach( (name, index) => {
      headers[index] = Object.keys(HEADERNAMES).find(key => HEADERNAMES[key] === name);
    })

    headers.forEach( (header, index) => {
      sorted[index] = data[header];
    });

    SHEETS.Aurum.appendRow(sorted);
    return 0;
  } catch (err) {
    console.error(`"SetRowData()" failed : ${err}`);
    return 1;
  }
}

const _testSet = () => {
  const d = GetRowData(SHEETS.Aurum, 5);
  // const e = GetRowData(SHEETS.Aurum, 6);
  SetRowData(SHEETS.Aurum, d);
}



/**
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
    return 0;
  } catch(err) {
    console.error(`"SetByHeader()" failed : ${err}`);
    return 1;
  }
};




/**
 * Find Image blob from File
 * @param {png} file
 */
const GetImage = async (pngFile) => {
  const repo = `https://live3dprinteros.blob.core.windows.net/render/${pngFile}`;
  const folder = DriveApp.getFoldersByName(`Job Tickets`);

  const params = {
    method : "GET",
    contentType : "image/png",
    followRedirects : true,
    muteHttpExceptions : true
  };

  try {
    const response = await UrlFetchApp.fetch(repo, params);
    const responseCode = response.getResponseCode();
    if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`); 

    const blob = response.getBlob().setName(`IMAGE_${pngFile}`);
    return blob;
  } catch(err) {
    console.error(`"GetImage()" failed : ${err}`);
    return 1;
  }
}


/**
 * Search all Sheets for a value
 * @required {string} value
 * @returns {[sheet, [values]]} list of sheets with lists of indexes
 */
const Search = (value) => {
  try {
    if (value === null || value === undefined) throw new Error(`Bad inputs to function. Value: ${value}`);
    value = value.toString().replace(/\s+/g, "");
    let res = {};
    Object.values(SHEETS).forEach(sheet => {
      const finder = sheet.createTextFinder(value).findAll();
      if (finder != null) {
        temp = [];
        finder.forEach(result => temp.push(result.getRow()));
        res[sheet.getName()] = temp;
      }
    })
    // console.info(JSON.stringify(res));
    return res;
  } catch(err) {
    console.error(`"Search()" failed : ${err}`);
    return 1;
  }
}


/**
 * Search all Sheets for one specific value
 * @required {string} value
 * @returns {[sheet, [number]]} [sheetname, row]
 */
const FindOne = (value) => {
  if (value) value.toString().replace(/\s+/g, "");
  let res = {};
  for(const [key, sheet] of Object.entries(SHEETS)) {
    const finder = sheet.createTextFinder(value).findNext();
    if (finder != null) {
      // res[key] = finder.getRow();
      res = GetRowData(sheet, finder.getRow());
    }
  }
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
 * Check if this sheet is forbidden
 * @param {sheet} sheet to check
 * @returns {bool} false if sheet is allowed
 * @returns {bool} true if forbidden
 */
const CheckSheetIsForbidden = (someSheet) => {
  try {
    if (typeof(someSheet) !== `object`) throw new Error(`A non-sheet argument was passed to a function that requires a sheet.`);
    
    let forbiddenNames = [];
    Object.values(OTHERSHEETS).forEach(sheet => forbiddenNames.push(sheet.getSheetName()));
    return forbiddenNames.includes(someSheet.getName());
  } catch(err) {
    console.error(`"CheckSheetIsForbidden()" failed : ${err}`);
    return 1;
  }
}




/**
 * Get Type
 * @param {*} object to analyze
 * @return {object} object information
 */
const GetObjectType = (ob) => {
  let stringify;
  try {
    if (ob !== Object(ob)) {
      return {
        type : typeof ob,
        value : ob,
        length : typeof ob === `string` ? ob.length : null 
      };
    } 
    try {
      stringify = JSON.stringify(ob);
      console.warn(stringify);
    } catch (err) {
      stringify = `{ "result" : "unable to stringify" }`
      console.error(stringify);
    }
    return {
      type : typeof ob ,
      value : stringify,
      name : ob.constructor ? ob.constructor.name : null,
      nargs : ob.constructor ? ob.constructor.arity : null,
      length : Array.isArray(ob) ? ob.length:null
    };       
  } catch(err) {
    return { type : `indeterminate type`, } ;
  }
}



/**
 * Fix Statuses
 */
const FixStatus = () => {
  try {
    console.info(`Checking Statuses....`);
    Object.values(SHEETS).forEach(sheet => {
      let posCodes = GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      posCodes.forEach( (code, index) => {
        switch(code) {
          case STATUS.queued.statusCode:
            if (statuses[index + 2] != STATUS.queued.plaintext) {
              SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.queued.plaintext);
              console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
            }
            break;
          case STATUS.inProgress.statusCode:
            if (statuses[index + 2] != STATUS.inProgress.plaintext) {
              SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.inProgress.plaintext);
              console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
            }
            break;
          case STATUS.failed.statusCode:
            if (statuses[index + 2] != STATUS.failed.plaintext) {
              SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.failed.plaintext);
              console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
            }
            break;
          case STATUS.cancelled.statusCode:
            if (statuses[index + 2] != STATUS.cancelled.plaintext) {
              SetByHeader(sheet, HEADERNAMES.status, index + 2, STATUS.cancelled.plaintext);
              console.warn(`Changed ${sheet.getSheetName()} @ Index ${index + 2}`);
            }
            break;
        }
      });
    })
    console.warn(`Statuses Checked and Fixed....`);
    return 0;
  } catch(err) {
    console.error(`"FixStatuses()" failed : ${err}`);
    return 1;
  }
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

const FormatDate = (date) => Utilities.formatDate(date ? date : new Date(), "PST", "MM/dd/yyyy 'at' HH:mm:ss z");



/**
 * Set Dropdowns for status
 */
const SetStatusDropdowns = () => {
  try {
    let statuses = [];
    Object.values(STATUS).forEach(status => statuses.push(status.plaintext));
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(statuses);
    Object.values(SHEETS).forEach(sheet => sheet.getRange(2, 1, sheet.getLastRow(), 1).setDataValidation(rule));
    return 0;
  } catch(err) {
    console.error(`"SetStatusDropdowns()" failed : ${err}`);
    return 1;
  }
}


/**
 * Helper Method for TitleCasing Names
 * @param {string} string
 * @returns {string} titlecased
 */
const TitleCase = (str) => {
  str = str
    .toLowerCase()
    .split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
}






