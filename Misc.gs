/**
 * -----------------------------------------------------------------------------------------------------------------
 * MISC
 */


/** 
 * Merge Objects
 * @param {object} (rowData)
 * @param {object} (rowData2)
 * @returns {object} Merged Row Data
 */
const MergeObjects = (objA, objB) => {
  let result = {};

  for (let key in objA) {
    if (objA.hasOwnProperty(key)) {
      result[key] = objA[key] !== null ? objA[key] : objB[key];
    }
  }

  for (let key in objB) {
    if (objB.hasOwnProperty(key) && !result.hasOwnProperty(key)) {
      result[key] = objB[key];
    }
  }

  return result;
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
 * Get Status By Code
 * @param {number} statusCode
 */
const GetStatusByCode = (posStatCode = 2) => {
  try {
    for(let i = 0; i < Object.values(STATUS).length; i++) {
      if(Object.values(STATUS)[i].statusCode == posStatCode) {
        // console.info(Object.values(STATUS)[i].plaintext)
        return Object.values(STATUS)[i].plaintext;
      }
    }
  } catch(err) {
    console.error(`"GetStatusByCode()" failed : ${err}`);
    return 1;
  }
}

/**
 * Fix Statuses
 */
const FixStatus = () => {
  try {
    Object.values(SHEETS).forEach(sheet => {
      console.warn(`Checking Statuses for ${sheet.getSheetName()}....`);
      const posCodes = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
      const statuses = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);
      posCodes.forEach( (code, index) => {
        const status = GetStatusByCode(code);
        // console.info(`S: ${statuses[index]}:  Stat: ${status}, Code: ${code}`);
        if(statuses[index] != status) {
          console.info(`Found Error: Status Claimed: ${statuses[index]},  Status Actual: ${status}`);
          SheetService.SetByHeader(sheet, HEADERNAMES.status, index + 2, status);
        }
      });
      console.warn(`Statuses Checked and Fixed for ${sheet.getSheetName()}....`);
    });
    return 0;
  } catch(err) {
    console.error(`"FixStatuses()" failed : ${err}`);
    return 1;
  }
}



/**
 * Set Dropdowns for status
 * @TRIGGERED
 */
const SetStatusDropdowns = () => {
  try {
    let statuses = [];
    Object.values(STATUS).forEach(status => statuses.push(status.plaintext));
    const rule = SpreadsheetApp
      .newDataValidation()
      .requireValueInList(statuses);
    Object.values(SHEETS).forEach(sheet => sheet.getRange(2, 1, sheet.getLastRow(), 1).setDataValidation(rule));
    return 0;
  } catch(err) {
    console.error(`"SetStatusDropdowns()" failed : ${err}`);
    return 1;
  }
}

/**
 * Build Summary Equation:
 * @TRIGGERED
 * FORMAT: `={QUERY(Spectrum!A2:S, "Select * Where A = 'Queued' OR A = 'In-Progress' LABEL A 'Spectrum' \n");
    QUERY(Zardoz!A2:S, "Select * Where A = 'Queued' OR A = 'In-Progress' LABEL A 'Zardoz' "); 
    }`
 */
const BuildSummaryEquation = () => {
  try {
    let query = `={`
    Object.entries(PRINTERDATA).forEach(([key, value], idx) => {
      console.info(`ENTRY: IDX: ${idx}, Key: ${key}, Value: ${JSON.stringify(value, null, 3)}`);
      const queryString = `QUERY(${key}!A2:S, "Select * Where A = 'Queued' OR A = 'In-Progress' LABEL A '${key}' ")`;
      query += queryString;
      if(idx != Object.entries(PRINTERDATA).length -1) {
        query += `;\n`; // The very last semicolon throws an error when present.
      }
    });
    query += `}`;
    console.info(query);
    OTHERSHEETS.Summary.getRange(3, 1, 1, 1).setValue(query);
    return 0;
  } catch(err) {
    console.error(`"BuildSummaryEquation()" failed: ${err}`);
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

/**
 * Get Function Name
 */
const GetFunctionName = () => {
  let stack = new Error().stack.split('\n')[2].split(`at `)[1];
  stack = stack ? stack : `Unknown Function`;
  return stack;
}

/**
 * Execute with Timeout
 * @param {function} some function to run
 * @param {number} timeout in seconds
 * @returns {Promise} race
 */
const ExecuteWithTimeout = (fn, timeout = 2) => {
  timeout = timeout > 0 ? timeout * 1000 : 2000;
  const startTime = new Date().getTime();

  const timeoutPromise = new Promise((_, reject) => {
    // Continuously check the elapsed time without setTimeout
    while (new Date().getTime() - startTime < timeout) {
      // No operation, just waiting
    }
    reject("Execution timed out!");
  });

  // Wrap the function execution in a promise
  const executionPromise = new Promise((resolve, reject) => {
    try {
      const result = fn();  // Execute the function
      resolve(result);
    } catch (error) {
      reject(`Error during execution: ${error.message}`);
    }
  });
  
  return Promise.race([executionPromise, timeoutPromise]);  // Use Promise.race() to return whichever promise resolves or rejects first
}


