/**
 * Status Service Class
 * @NOTIMPLEMENTED
 * @private
 */

class StatusService {
  constructor() {
    this.state = STATUS.queued;
  }

  /**
   * Get State
   */
  GetState() {
    return this.state;
  }

  /**
   * Set State
   */
  SetState(newState = ``) {
    if (!Object.values(STATUS).includes(newState)) throw new Error(`Invalid state: ${newState}`);
    this.state = newState;
  }

  /**
   * Method to check if the current state matches a specific state
   */
  CheckState(stateToCheck = ``) {
    return this.state === stateToCheck;
  }

  /**
   * Method to check if the current state is one of the provided states
   */
  IsOneOf(...states) {
    return states.includes(this.state);
  }

  /** 
   * Reset state to 'none'
   */
  ResetState() {
    this.state = STATUS.queued;
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
  static FixAllStatuses() {
    try {
      Object.values(SHEETS).forEach(sheet => StatusService.FixSheetStatuses(sheet));
      return 0;
    } catch(err) {
      console.error(`"FixAllStatuses()" failed: ${err}`);
      return 1;
    }
  }

  /**
   * Fix a Single Sheet's Statuses
   * @param {sheet} sheet
   * @returns {bool} success
   * @private
   */
  static FixSheetStatuses(sheet = SHEETS.Aurum) {
    try {
      console.warn(`Checking Statuses for ${sheet.getSheetName()}....`);
      const posCodes = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.posStatCode);
      const statuses = SheetService.GetColumnDataByHeader(sheet, HEADERNAMES.status);
      posCodes.forEach( (code, index) => {
        const status = StatusService.GetStatusByCode(code);
        if(statuses[index] != status) {
          console.info(`Found Error: Status Claimed: ${statuses[index]},  Status Actual: ${status}`);
          SheetService.SetByHeader(sheet, HEADERNAMES.status, index + 2, status);
        }
      });
      console.warn(`Statuses Checked and Fixed for ${sheet.getSheetName()}....`);
      return 0;
    } catch(err) {
      console.error(`"FixSheetStatuses()" failed: ${err}`);
      return 1;
    }
  }


}


const _test_State = () => {
  const task = new StatusService();
  task.SetState(STATUS.queued);
  console.log(task.state); // Output: 'queued'
  console.log(`State (${task.state.plaintext}) is ${STATUS.queued.plaintext}: ${task.CheckState(STATUS.queued)}`); // Output: true
  console.log(task.IsOneOf(STATUS.complete, STATUS.queued)); // Output: true
  task.SetState(STATUS.complete);
  console.log(task.state); // Output: 'complete'
}



/**
 * Fix Statuses
 */
const FixStatus = () => StatusService.FixAllStatuses();



/**
 * Set Dropdowns for status
 * @TRIGGERED
 */
const SetStatusDropdowns = () => {
  try {
    let statuses = [...Object.values(STATUS).map(status => status.plaintext)];
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


