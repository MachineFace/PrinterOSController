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
  static GetAverageTurnaround(sheet) {
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
      console.error(`"GetAverageTurnaround()" failed : ${err}`);
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
        let turnaround = Calculate.GetAverageTurnaround(value);
        obj[key] = turnaround;
      }

      OTHERSHEETS.Metrics.getRange(3, 1, 1, 1).setValue(`Printer`);
      Object.entries(obj).forEach(([key, value], index) => {
        console.info(`${index} : ${key} : ${value}`);
        const values = [ [ key, value ], ];
        OTHERSHEETS.Metrics.getRange(4 + index, 1, 1, 2).setValues(values);
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
        .forEach( key => count[key] = ++count[key] || 0);
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
        const completed = value.Completed ? value.Completed : 0;
        const cancelled = value.Cancelled ? value.Cancelled : 0;
        let ratio = Number(completed / (completed + cancelled)).toFixed(3);
        ratio = `${Number(ratio * 100).toFixed(1)} %`;
        const values = [ [ completed, cancelled, ratio ], ];
        OTHERSHEETS.Metrics.getRange(4 + index, 3, 1, 3).setValues(values);
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
  static GetDistribution() {
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
      console.error(`"GetDistribution()" failed : ${err}`);
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
      OTHERSHEETS.Metrics.getRange(20, 2, 1, 2).setValues([[ `User Count`, count ]]);
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
      console.info(`Number of Users -----> ${count}`);
      OTHERSHEETS.Metrics.getRange(22, 2, 1, 2).setValues([[ `Unique Users`, count ]]);
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
      OTHERSHEETS.Metrics.getRange(23, 2, 1, 2).setValues([[ `Total Submissions`, count ]]);
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
    const values = [
      [ `Completed Prints`, count.complete ? count.complete : 0 ],
      [ `Cancelled Prints`, count.cancelled ? count.cancelled : 0 ],
      [ `In-Progress Prints`, count.inProgress ? count.inProgress : 0 ],
      [ `Queued Prints`, count.queued ? count.queued : 0 ],
    ];
    OTHERSHEETS.Metrics.getRange(25, 2, values.length, 2).setValues(values);
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
      // users.forEach( (user, index) => OTHERSHEETS.Unique.getRange(2 + index, 1, 1, 1).setValue(user));
      OTHERSHEETS.Metrics.getRange(21, 2, 1, 2).setValues([[`Users who have printed`, users.length]]);
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
  static GetStandardDeviation() {
    try {
      const distribution = Calculate.GetDistribution();
      const n = distribution.length;

      let data = [];
      distribution.forEach(item => data.push(item[1]));
        
      let mean = data.reduce((a, b) => a + b) / n;

      let s = Math.sqrt(data
        .map(x => Math.pow(x - mean, 2))
        .reduce((a, b) => a + b) / n);
      let standardDeviation = Number(Math.abs(s - mean)).toFixed(4);
      console.info(`Standard Deviation for Number of Submissions : +/- ${standardDeviation}`);

      OTHERSHEETS.Metrics.getRange(43, 2, 1, 2).setValues([[ `Standard Deviation for Number of Submissions per User`, `+/- ${standardDeviation}` ]]);
      return standardDeviation;
    } catch(err) {
      console.error(`"GetStandardDeviation()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Arithmetic Mean
   * @return {number} mean
   */
  static GetArithmeticMean() {
    try {
      const distribution = Calculate.GetDistribution();
      const n = distribution.length;

      const data = [];
      distribution.forEach(item => data.push(item[1]));
        
      let mean = Number(data.reduce((a, b) => a + b) / n).toFixed(4);
      console.info(`Mean = ${mean}`);

      OTHERSHEETS.Metrics.getRange(44, 2, 1, 2).setValues([[ `Arithmetic Mean for user submissions`, mean ]]);
      return mean;
    } catch(err) {
      console.error(`"GetArithmeticMean()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Print Top Ten
   */
  static PrintTopTen() {
    try {
      const distribution = Calculate.GetDistribution()
        .slice(0, 11);
      console.info(distribution);

      distribution.forEach((pair, index) => {
        const values = [ [ index + 1, pair[0], pair[1] ], ];
        OTHERSHEETS.Metrics.getRange(30 + index, 1, 1, 3).setValues(values); 
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
        if(statuses[i] != STATUS.complete.plaintext && statuses[i] != STATUS.closed.plaintext) weights[i] = 0.0;
        if(weights[i] == null || !weights[i] || weights[i] == ' ' || isNaN(weights[i])) weights[i] = 0.0;
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
      OTHERSHEETS.Metrics.getRange(46, 2, 1, 2).setValues([[ `Sum of All Materials (Grams)`, total ]]);
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
      Object.values(SHEETS).forEach(sheet => counts.push([Calculate._SumSingleSheetMaterials(sheet)]));
      OTHERSHEETS.Metrics.getRange(3, 7, 1, 1).setValue(`PLA Used (grams)`);
      OTHERSHEETS.Metrics.getRange(4, 7, counts.length, 1).setValues(counts);

      let total = Number(counts.reduce((a,b) => Number(a) + Number(b))).toFixed(2);
      const numOfSpools = Number(total * 0.001).toFixed(2);
      console.info(`Number of Spools Used: ${numOfSpools}`);
      OTHERSHEETS.Metrics.getRange(48, 2, 1, 2).setValues([[ `Number of Spools Used`, numOfSpools ]]);
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
        if(cost[i] === null || !cost[i] || cost[i] == ' ' || isNaN(cost[i])) cost[i] = 0.0;
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
      OTHERSHEETS.Metrics.getRange(47, 2, 1, 2).setValues([[ `Sum of All Funds Generated ($)`, total ],]);
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
      Object.values(SHEETS).forEach(sheet => counts.push([Calculate._SumSingleSheetCost(sheet)]));
      OTHERSHEETS.Metrics.getRange(3, 6, 1, 1).setValue(`Funds Generated ($)`);
      OTHERSHEETS.Metrics.getRange(4, 6, counts.length, 1).setValues(counts);
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
    Calculate.GetStandardDeviation();
    Calculate.GetArithmeticMean();
    Calculate.StatusCounts();
    Calculate.PrintUniqueUsersWhoHavePrinted();
    Calculate.SumMaterials();
    Calculate.SumCosts();
    Calculate.PrintSheetCosts();
    Calculate.PrintSheetMaterials();
    console.info(`Recalculated Metrics`);
    return 0;
  } catch (err) {
    console.error(`"Metrics()" failed : ${err}`);
    return 1;
  }
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Testing for Metrics
 */
const _testMetrics = () => {
  // console.info(Calculate.GetAverageTurnaround(SHEETS.Spectrum));
  Calculate.PrintSheetCosts();
}






