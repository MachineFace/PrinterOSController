/**
 * ----------------------------------------------------------------------------------------------------------------
 * Generate new Job number from a date
 * @param {time} date
 * @return {number} job number
 */


/**
 * Create a New uuid
 * @return {string} uuid
 */
const CreateId = () => {
  const id = Utilities.getUuid();
  console.info(`Id Created: ${id}`);
  return id;
}

/**
 * Is Valid UUID
 * @param {string} uuid
 * @returns {bool} valid
 */
const IsValid = (uuid = `aae7ff37-b6cd-4ba7-a649-7682aa772712`) => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
};


/**
 * Find by Id
 * @param {string} uuid
 * @returns {object} sheet and row 
 */
const FindById = (uuid = `aae7ff37-b6cd-4ba7-a649-7682aa772712`) => {
  let res = {};
  try {
    if (!this.IsValid(uuid)) throw new Error(`Invalid uuid supplied...`);
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    sheets.forEach(sheet => {
      const finder = sheet.createTextFinder(uuid).findNext();
      if (finder != null) res[sheet.getName()] = finder.getRow();
    });
    console.info(JSON.stringify(res));
    return res;
  } catch(err) {
    console.error(`"FindByuuid()" failed: ${err}`);
    return 1;
  }
}

/**
 * Convert a UUID to decimal
 * @param {string} uuid
 * @return {number} decimals
 */
const toDecimal = (uuid = `aae7ff37-b6cd-4ba7-a649-7682aa772712`) => {
  const hex = uuid.replace(/-/g, '');
  const decimal = BigInt(`0x${hex}`).toString();  // Convert hexadecimal to decimal
  const paddedDecimal = decimal.padStart(40, '0');  // Pad decimal with leading zeros to ensure 40 digits
  return paddedDecimal;
}

/**
 * Convert a Decimal Value to UUID
 * @param {number} decimal
 * @return {string} uuid
 */
const decimalToUUID = (decimal = `0244711056233028958513683553892786000406`) => {
  const paddedDecimal = decimal.toString().padStart(40, '0');  // Pad decimal with leading zeros to ensure 40 digits
  const hex = BigInt(paddedDecimal).toString(16);   // Convert decimal to hexadecimal

  // Insert dashes to create the UUID format
  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');

  return uuid;
}






