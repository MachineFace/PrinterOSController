/**
 * -----------------------------------------------------------------------------------------------------------------
 * Calculate Metrics
 */
class Calculate {
  constructor() {

  }

  /**
   * Calculate Average Turnaround for a sheet
   * @param {sheet} sheet
   * @return {number} average (hrs)
   */
  static CalculateAverageTurnaround(sheet) {
    try {
      if(CheckSheetIsForbidden(sheet)) throw new Error(`Sheet is FORBIDDEN.`);
      let completionTimes = GetColumnDataByHeader(sheet, HEADERNAMES.duration)
        .filter(Boolean);

      const total = completionTimes ? completionTimes.reduce((a, b) => a + b) : 0;
      const count = completionTimes ? completionTimes.length : 0;

      // Average the totals (a list of times in minutes)
      let average = Number(total / count).toFixed(2);
      console.info(`Total Time : ${Number(total).toFixed(2)}, Average : ${average}`);
      return average;
    } catch (err) {
      console.error(`"CalculateAverageTurnaround()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Turnaround Averages
   */
  static PrintTurnarounds() {
    try {
      let obj = {}
      for(const [key, value] of Object.entries(SHEETS)) {
        let turnaround = Calculate.CalculateAverageTurnaround(value);
        obj[key] = turnaround;
      }

      Object.entries(obj).forEach(([key, value], index) => {
        // console.info(`${index} : ${key} : ${value}`);
        OTHERSHEETS.Metrics.getRange(4 + index, 1, 1, 1).setValue(key);
        OTHERSHEETS.Metrics.getRange(4 + index, 5, 1, 1).setValue(value);
      });
      return 0;
    } catch(err) {
      console.error(`"PrintTurnarounds()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Sum a Sheet's Statuses
   * @param {sheet} sheet
   * @return {object} status counts
   */
  static SumStatuses(sheet) {
    try {
      if(CheckSheetIsForbidden(sheet)) throw new Error(`Bad sheet.`);
      let count = {};
      GetColumnDataByHeader(sheet, HEADERNAMES.status)
        .filter(Boolean)
        .forEach( key => count[key] = ++count[key] || 1);
      // console.info(JSON.stringify(count, null, 3));
      return count;
    } catch(err) {
      console.error(`"SumStatuses()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Status Counts
   */
  static PrintStatusCounts() {
    try {
      let obj = {};
      for(const [key, sheet] of Object.entries(SHEETS)) {
        let counts = Calculate.SumStatuses(sheet);
        obj[key] = counts;
      }

      Object.entries(obj).forEach(([key, value], index) => {
        console.info(`${index} : ${key} : ${JSON.stringify(value)}`);

        let ratio = Number(value.Completed / (value.Completed + value.Cancelled)).toFixed(3);
        ratio = `${Number(ratio * 100).toFixed(1)} %`;
        OTHERSHEETS.Metrics.getRange(4 + index, 2, 1, 1).setValue(value.Completed);
        OTHERSHEETS.Metrics.getRange(4 + index, 3, 1, 1).setValue(value.Cancelled);
        OTHERSHEETS.Metrics.getRange(4 + index, 4, 1, 1).setValue(ratio);
      })
      return obj;
    } catch(err) {
      console.error(`"PrintStatusCounts()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Calculate User Distribution
   * @return {[]} users and counts
   */
  static CalculateDistribution() {
    try {
      let userList = [];
      let staff = GetColumnDataByHeader(OTHERSHEETS.Staff, `EMAIL`);
      Object.values(SHEETS).forEach(sheet => {
        GetColumnDataByHeader(sheet, HEADERNAMES.email)
          .filter(Boolean)
          .forEach( user => {
            if(staff.indexOf(user) == -1) userList.push(user);
          });
      });
      let occurrences = userList.reduce( (acc, curr) => {
        return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
      }, {});
      let items = Object.keys(occurrences)
        .map(key => [key, occurrences[key]])
        .sort((first, second) => second[1] - first[1]);
      return items;  
    } catch(err) {
      console.error(`"CalculateDistribution()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Get User Counts from PrinterOS
   * @return {object} counts
   */
  static async GetUserCount() {
    let count = 0;
    let users = [];
    const pos = new PrinterOS();
    pos.Login()
    .then(() => {
      let groupCount = 0;
      JACOBSWORKGROUPS.forEach( async (group) => {
        await pos.GetUsersByWorkgroup(group)
          .forEach(user => {
            users.push(user["email"]);
            groupCount++;
          });
      });
      count += groupCount;
    })
    .then( async() => {
      console.info(count)
      let temp = await users;
      temp = [].concat(...temp);
      count = new Set(temp).size;
      console.info(`Count : ${count}`);
      OTHERSHEETS.Metrics.getRange(20, 2, 1, 1).setValue(`User Count`);
      OTHERSHEETS.Metrics.getRange(20, 3, 1, 1).setValue(count);
    })
    .finally(() => {
      pos.Logout();
    })
    return await count;
  }

  /**
   * Count Unique Users
   */
  static CountUniqueUsers() {
    try {
      let userList = [];
      Object.values(SHEETS).forEach(sheet => {
        GetColumnDataByHeader(sheet, HEADERNAMES.email)
          .filter(Boolean)
          .forEach( user => userList.push(user));
      });
      const count = new Set(userList).size
      OTHERSHEETS.Metrics.getRange(22, 2, 1, 1).setValue(`Unique Users`);
      OTHERSHEETS.Metrics.getRange(22, 3, 1, 1).setValue(count);
      console.info(`Number of Users -----> ${count}`);
      return count;
    } catch(err) {
      console.error(`"CountUniqueUsers()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Count Total Submissions
   * @return {number} count
   */
  static CountTotalSubmissions() {
    try {
      let count = 0;
      Object.values(SHEETS).forEach(sheet => {
        let last = sheet.getLastRow() - 1;
        count += last;
      })
      console.info(`Total Count : ${count}`);
      OTHERSHEETS.Metrics.getRange(23, 2, 1, 1).setValue(`Total Submissions`);
      OTHERSHEETS.Metrics.getRange(23, 3, 1, 1).setValue(count);
      return count;
    } catch(err) {
      console.error(`"CountTotalSubmissions()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Status Counts
   * @return {object} counts
   */
  static StatusCounts() {
    let count = {};
    Object.values(SHEETS).forEach(sheet => {
      let temp = [];
      GetColumnDataByHeader(sheet, HEADERNAMES.status)
        .filter(Boolean)
        .forEach( (stat, index) => {
          temp.push(Object.keys(STATUS).find(key => STATUS[key].plaintext === stat));
        });
      temp.forEach(key => count[key] = ++count[key] || 1);
    });

    console.info(count);
    OTHERSHEETS.Metrics.getRange(25, 2, 1, 1).setValue(`Completed Prints`);
    OTHERSHEETS.Metrics.getRange(25, 3, 1, 1).setValue(count.complete);

    OTHERSHEETS.Metrics.getRange(26, 2, 1, 1).setValue(`Cancelled Prints`);
    OTHERSHEETS.Metrics.getRange(26, 3, 1, 1).setValue(count.cancelled);

    OTHERSHEETS.Metrics.getRange(27, 2, 1, 1).setValue(`In-Progress Prints`);
    OTHERSHEETS.Metrics.getRange(27, 3, 1, 1).setValue(count.inProgress);

    OTHERSHEETS.Metrics.getRange(28, 2, 1, 1).setValue(`Queued Prints`);
    OTHERSHEETS.Metrics.getRange(28, 3, 1, 1).setValue(count.queued);
    return count;
  }
  
  /**
   * Count Unique Users Who Have Printed
   * return {object} users
   */
  static CountUniqueUsersWhoHavePrinted() {
    let userList = [];
    Object.values(SHEETS).forEach(sheet => {
      let status = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      let users = GetColumnDataByHeader(sheet, HEADERNAMES.email);
      status.forEach( (stat, index) => {
        if(stat == STATUS.complete.plaintext) userList.push(users[index])
      });
    })
    const userSet = [...new Set(userList)];
    console.info(`Number of Users who have Successfully print : ${userSet.length}`);
    return userSet;
  }

  /**
   * Print Users Who have Printed
   */
  static PrintUniqueUsersWhoHavePrinted() {
    try {
      const users = Calculate.CountUniqueUsersWhoHavePrinted();
      OTHERSHEETS.Unique.getRange(1, 3, 1, 1).setValue(`Total Successful Students : `);
      OTHERSHEETS.Unique.getRange(1, 4, 1, 1).setValue(users.length);
      users.forEach( (user, index) => OTHERSHEETS.Unique.getRange(2 + index, 1, 1, 1).setValue(user));
      OTHERSHEETS.Metrics.getRange(21, 2, 1, 1).setValue(`Users who have printed`);
      OTHERSHEETS.Metrics.getRange(21, 3, 1, 1).setValue(users.length);
      return 0;
    } catch(err) {
      console.error(`"PrintUniqueUsersWhoHavePrinted()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Standard Deviation for Users
   * @return {number} standard deviation
   */
  static CalculateStandardDeviation() {
    try {
      const distribution = Calculate.CalculateDistribution();
      const n = distribution.length;

      let data = [];
      distribution.forEach(item => data.push(item[1]));
        
      let mean = data.reduce((a, b) => a + b) / n;

      let s = Math.sqrt(data
        .map(x => Math.pow(x - mean, 2))
        .reduce((a, b) => a + b) / n);
      let standardDeviation = Number(Math.abs(s - mean)).toFixed(4);
      console.info(`Standard Deviation for Number of Submissions : +/- ${standardDeviation}`);

      OTHERSHEETS.Metrics.getRange(43, 2, 1, 1).setValue(`Standard Deviation for Number of Submissions per User`);
      OTHERSHEETS.Metrics.getRange(43, 3, 1, 1).setValue(`+/- ${standardDeviation}`);
      return standardDeviation;
    } catch(err) {
      console.error(`"CalculateStandardDeviation()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Arithmetic Mean
   * @return {number} mean
   */
  static CalculateArithmeticMean() {
    try {
      const distribution = Calculate.CalculateDistribution();
      const n = distribution.length;

      const data = [];
      distribution.forEach(item => data.push(item[1]));
        
      let mean = Number(data.reduce((a, b) => a + b) / n).toFixed(4);
      console.info(`Mean = ${mean}`);

      OTHERSHEETS.Metrics.getRange(44, 2, 1, 1).setValue(`Arithmetic Mean for user submissions`);
      OTHERSHEETS.Metrics.getRange(44, 3, 1, 1).setValue(mean);
      return mean;
    } catch(err) {
      console.error(`"CalculateArithmeticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Top Ten
   */
  static PrintTopTen() {
    try {
      const distribution = Calculate.CalculateDistribution()
        .slice(0, 11);
      console.info(distribution);

      distribution.forEach((pair, index) => {
        OTHERSHEETS.Metrics.getRange(30 + index, 1, 1, 1).setValue(index + 1); // Index
        OTHERSHEETS.Metrics.getRange(30 + index, 2, 1, 1).setValue(pair[0]); // Name
        OTHERSHEETS.Metrics.getRange(30 + index, 3, 1, 1).setValue(pair[1]); // Number of Prints
      });
      return 0;
    } catch(err) {
      console.error(`"PrintTopTen()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Count Categorical
   * @private
   */
  _CountCategorical(list) {
    let count = {};
    list.forEach( key => count[key] = ++count[key] || 1);
    return count;
  }

  /** 
   * Sum Single Sheet Materials
   * @private 
   */
  static _SumSingleSheetMaterials(sheet) {
    try {
      if(CheckSheetIsForbidden(sheet)) throw new Error(`Sheet is FORBIDDEN.`);
      let weights = GetColumnDataByHeader(sheet, HEADERNAMES.weight);
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      for(let i = 0; i < weights.length; i++) {
        if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) weights[i] = 0.0;
        if(weights[i] === null || !weights[i] || weights[i] == ' ') weights[i] = 0.0;
      }
      let sum = Number(weights.reduce((a,b) => a + b)).toFixed(2);
      console.info(`SUM for ${sheet.getSheetName()} = ${sum} grams`);
      return sum;
    } catch(err) {
      console.error(`"_SumSingleSheetMaterials()" failed : ${err}`);
      return 1;
    }
  }
  
  /**
   * Sum Materials
   * @return {object} number
   */
  static SumMaterials() {
    try {
      let count = [];
      Object.values(SHEETS).forEach(sheet => count.push(Calculate._SumSingleSheetMaterials(sheet)));
      console.info(count);
      let total = Number(count.reduce((a,b) => Number(a) + Number(b))).toFixed(2);
      console.info(`Total Count of All Materials : ${total}`);
      OTHERSHEETS.Metrics.getRange(`B46`).setValue(`Sum of All Materials (Grams)`);
      OTHERSHEETS.Metrics.getRange(`C46`).setValue(total);
      return total;
    } catch(err) {
      console.error(`"SumMaterials()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Sheet Materials
   */
  static PrintSheetMaterials() {
    try {
      let counts = [];
      Object.values(SHEETS).forEach(sheet => counts.push(Calculate._SumSingleSheetMaterials(sheet)));
      console.info(counts);
      OTHERSHEETS.Metrics.getRange(3, 6, 1, 1).setValue(`PLA Used (grams)`);
      for(let i = 0; i < counts.length; i++) {
        OTHERSHEETS.Metrics.getRange(4 + i, 6, 1, 1).setValue(`${counts[i]}`);
      }
      return 0;
    } catch(err) {
      console.error(`"PrintSheetMaterials()" failed : ${err}`);
      return 1;
    }
   
  }

  /** 
   * _SumSingleSheetCost
   * @private 
   * @param {sheet} sheet
   */
  static _SumSingleSheetCost(sheet) {
    try {
      if(CheckSheetIsForbidden(sheet)) throw new Error(`Sheet is FORBIDDEN.`);
      let cost = GetColumnDataByHeader(sheet, HEADERNAMES.cost);
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
      for(let i = 0; i < cost.length; i++) {
        if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) cost[i] = 0.0;
        if(cost[i] === null || !cost[i] || cost[i] == ' ') cost[i] = 0.0;
      }
      let sum = Number(cost.reduce((a,b) => a + b)).toFixed(2);
      console.info(`SUM for ${sheet.getSheetName()} = $${sum}`);
      return sum;
    } catch(err) {
      console.error(`"_SumSingleSheetCost()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Sum Costs
   */
  static SumCosts() {
    try {
      let count = [];
      Object.values(SHEETS).forEach(sheet => count.push(Calculate._SumSingleSheetCost(sheet)));

      let total = Number(count.reduce((a,b) => Number(a) + Number(b))).toFixed(2);
      console.info(`Total Count of All Funds : $${total}`);
      OTHERSHEETS.Metrics.getRange(`B47`).setValue(`Sum of All Funds Generated ($)`);
      OTHERSHEETS.Metrics.getRange(`C47`).setValue(total);
      return total;
    } catch(err) {
      console.error(`"SumCosts()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Sheet Costs
   */
  static PrintSheetCosts() {
    try {
      let counts = [];
      Object.values(SHEETS).forEach(sheet => counts.push(Calculate._SumSingleSheetCost(sheet)));
      console.info(counts);
      OTHERSHEETS.Metrics.getRange(3, 5, 1, 1).setValue(`Funds Generated ($)`);
      for(let i = 0; i < counts.length; i++) {
        OTHERSHEETS.Metrics.getRange(4 + i, 5, 1, 1).setValue(`$${counts[i]}`);
      }
    } catch(err) {
      console.error(`"PrintSheetCosts()" failed : ${err}`);
      return 1;
    }
   
  }
  
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Run Metrics
 */
const Metrics = () => {
  try {
    console.warn(`Calculating Metrics .... `);
    Calculate.GetUserCount()
    Calculate.PrintTurnarounds();
    Calculate.PrintStatusCounts();
    Calculate.CountUniqueUsers();
    Calculate.CountTotalSubmissions();
    Calculate.PrintTopTen();
    Calculate.CalculateStandardDeviation();
    Calculate.CalculateArithmeticMean();
    Calculate.StatusCounts();
    Calculate.PrintUniqueUsersWhoHavePrinted();
    Calculate.SumMaterials();
    Calculate.SumCosts();
    Calculate.PrintSheetCosts();
    Calculate.PrintSheetMaterials();
    console.info(`Recalculated Metrics`);
  }
  catch (err) {
    console.error(`${err} : Couldn't generate statistics on Metrics.`);
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Metrics
 */
const _testMetrics = () => {
  // console.info(Calculate.CalculateAverageTurnaround(SHEETS.Spectrum));
  Calculate.SumMaterials();
}






