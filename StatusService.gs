/**
 * Status Service Class
 * @NOTIMPLEMENTED
 * @private
 */

class StatusService {
  constructor() {

  }

  get Status() {

  }

  /**
   * Get Status By Code
   * @param {number} statusCode
   * @returns {string} status
   */
  static GetStatusByCode(posStatCode = 2) {
    try {
      for(let i = 0; i < Object.values(STATUS).length; i++) {
        if(Object.values(STATUS)[i].statusCode == posStatCode) {
          // console.info(Object.values(STATUS)[i].plaintext)
          return Object.values(STATUS)[i].plaintext;
        }
      }
    } catch(err) {
      console.error(`"GetStatusByCode()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Get Status By Code
   * @param {string} status
   * @returns {number} statusCode
   */
  static GetCodeFromStatus(status = STATUS.queued.plaintext) {
    try {
      for(let i = 0; i < Object.values(STATUS).length; i++) {
        if(Object.values(STATUS)[i].plaintext == status) {
          // console.info(Object.values(STATUS)[i].plaintext)
          return Object.values(STATUS)[i].statusCode;
        }
      }
    } catch(err) {
      console.error(`"GetCodeFromStatus()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Fix Statuses
   */
  static FixStatuses() {
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
  const STATUS = Object.freeze({
  queued : {
    plaintext : `Queued`,
    statusCode : 11,
  },
  inProgress : {
    plaintext : `In-Progress`,
    statusCode : 21,
  },
  complete : {
    plaintext : `Completed`,
    statusCode : 77,
  },
  failed : {
    plaintext : `FAILED`,
    statusCode : 43,
  },
  cancelled : {
    plaintext : `Cancelled`,
    statusCode : 45,
  },
  pickedUp : {
    plaintext : `Picked Up`,
    statusCode : 99,
  },
  closed : {
    plaintext : `CLOSED`,
    statusCode : 98,
  },
  abandoned : {
    plaintext : `Abandoned`,
    statusCode : 97,
  },
});
*/
}