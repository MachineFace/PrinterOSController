/**
 * -----------------------------------------------------------------------------------------------------------------
 * Calculate Metrics
 */
class Calculate
{
  constructor() {

  }

  CalculateAverageTurnaround (sheet) {
    let culled = [];
    try {
      let completionTimes = GetColumnDataByHeader(sheet, HEADERNAMES.duration)
        .filter(Boolean);
        culled.push(...completionTimes);
    }
    catch (err) {
      console.error(`${err} : Couldn't fetch list of times. Probably a sheet error.`);
    }

    // Sum
    let total = 0;
    culled.forEach( time => {
      if(time) total += time;
      else total += 0;
    });

    // Average the totals (a list of times in minutes)
    let average = Number(total / culled.length).toFixed(2);
    console.info(`Total Time : ${total}, Average : ${average}`);
    return average;
  }
  PrintTurnarounds () {
    let obj = {}
    for(const [key, value] of Object.entries(SHEETS)) {
      let turnaround = this.CalculateAverageTurnaround(value);
      obj[key] = turnaround;
    }

    Object.entries(obj).forEach(([key, value], index) => {
      console.info(`${index} : ${key} : ${value}`);
      OTHERSHEETS.Metrics.getRange(4 + index, 1, 1, 1).setValue(key);
      OTHERSHEETS.Metrics.getRange(4 + index, 5, 1, 1).setValue(value);
    })
  }

  SumStatuses (sheet) {
    let count = {};
    let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status)
      .filter(Boolean);
    statuses.forEach( key => {
      count[key] = ++count[key] || 1;
    });
    return count;
  }
  PrintStatusCounts () {
    let obj = {};
    for(const [key, value] of Object.entries(SHEETS)) {
      let counts = this.SumStatuses(value);
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
  }

  CalculateDistribution () {
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
    let items = Object.keys(occurrences).map((key) => [key, occurrences[key]]);
    items.sort((first, second) => {
      return second[1] - first[1];
    });
    return items;  
  }

  async GetUserCount () {
    let count;
    let users = [];
    const pos = new PrinterOS();
    pos.Login()
    .then(() => {
      JACOBSWORKGROUPS.forEach( async (group) => {
        const res = await pos.GetUsersByWorkgroup(group);
        res.forEach(user => users.push(user["email"]));
      })
    })
    .then( async() => {
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
  PrintUniqueUsersWhoHavePrinted () {
    const users = this.CountUniqueUsersWhoHavePrinted();
    OTHERSHEETS.Unique.getRange(1, 3, 1, 1).setValue(`Total Successful Students : `);
    OTHERSHEETS.Unique.getRange(1, 4, 1, 1).setValue(users.length);
    users.forEach( (user, index) => OTHERSHEETS.Unique.getRange(2 + index, 1, 1, 1).setValue(user));
    OTHERSHEETS.Metrics.getRange(21, 2, 1, 1).setValue(`Users who have printed`);
    OTHERSHEETS.Metrics.getRange(21, 3, 1, 1).setValue(users.length);
  }

  CountUniqueUsers () {
    const countUnique = (iterable) => new Set(iterable).size;
    let userList = [];
    Object.values(SHEETS).forEach(sheet => {
      GetColumnDataByHeader(sheet, HEADERNAMES.email)
        .filter(Boolean)
        .forEach( user => userList.push(user));
    });
    const count = countUnique(userList);
    OTHERSHEETS.Metrics.getRange(22, 2, 1, 1).setValue(`Unique Users`);
    OTHERSHEETS.Metrics.getRange(22, 3, 1, 1).setValue(count);
    console.info(`Number of Users -----> ${count}`);
    return count;
  }

  CountTotalSubmissions () {
    let count = 0;
    Object.values(SHEETS).forEach(sheet => {
      let last = sheet.getLastRow() - 1;
      count += last;
    })
    console.info(`Total Count : ${count}`);
    OTHERSHEETS.Metrics.getRange(23, 2, 1, 1).setValue(`Total Submissions`);
    OTHERSHEETS.Metrics.getRange(23, 3, 1, 1).setValue(count);
    return count;
  }

  StatusCounts () {
    let count = {};
    Object.values(SHEETS).forEach(sheet => {
      let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status)
        .filter(Boolean);
      let temp = [];
      statuses.forEach( (stat, index) => {
        temp.push(Object.keys(STATUS).find(key => STATUS[key].plaintext === stat));
      })
      let countFunc = (keys) => count[keys] = ++count[keys] || 1;
      temp.forEach(countFunc);
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

  
  CountUniqueUsersWhoHavePrinted () {
    const countUnique = (iterable) => new Set(iterable);
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
  

  CalculateStandardDeviation () {
    const distribution = this.CalculateDistribution();
    const n = distribution.length;
    console.info(`n = ${n}`);

    const data = []
    distribution.forEach(item => data.push(item[1]));
      
    let mean = data.reduce((a, b) => a + b) / n;

    let s = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    let standardDeviation = s - mean;
    console.info(`Standard Deviation for Number of Submissions : +/-${standardDeviation}`);

    OTHERSHEETS.Metrics.getRange(43, 2, 1, 1).setValue(`Standard Deviation for Number of Submissions per User`);
    OTHERSHEETS.Metrics.getRange(43, 3, 1, 1).setValue(`+/- ${Number(standardDeviation).toFixed(2)}`);
    return standardDeviation;
  }

  CalculateArithmeticMean () {
    const distribution = this.CalculateDistribution();
    const n = distribution.length;
    console.info(`n = ${n}`);

    const data = []
    distribution.forEach(item => data.push(item[1]));
      
    let mean = data.reduce((a, b) => a + b) / n;
    console.info(`Mean = ${mean}`);

    OTHERSHEETS.Metrics.getRange(44, 2, 1, 1).setValue(`Arithmetic Mean for user submissions`);
    OTHERSHEETS.Metrics.getRange(44, 3, 1, 1).setValue(Number(mean).toFixed(2));
    return mean;
  }

  PrintTopTen () {
    const distribution = this.CalculateDistribution();

    // Create a new array with only the first 10 items
    let chop = distribution.slice(0, 11);
    console.info(chop);

    chop.forEach((pair, index) => {
      console.info(`${pair[0]} -----> ${pair[1]}`);
      OTHERSHEETS.Metrics.getRange(30 + index, 1, 1, 1).setValue(index + 1); // Index
      OTHERSHEETS.Metrics.getRange(30 + index, 2, 1, 1).setValue(pair[0]); // Name
      OTHERSHEETS.Metrics.getRange(30 + index, 3, 1, 1).setValue(pair[1]); // Number of Prints
    })
  }

  CountCategorical (list) {
    let count = {};
    list.forEach( key => count[key] = ++count[key] || 1);
    return count;
  }

  SumSingleSheetMaterials(sheet) {
    let weights = GetColumnDataByHeader(sheet, HEADERNAMES.weight);
    let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
    for(let i = 0; i < weights.length; i++) {
      if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) weights[i] = 0.0;
      if(weights[i] === null || !weights[i] || weights[i] == ' ') weights[i] = 0.0;
    }
    let sum = Number(weights.reduce((a,b) => a + b)).toFixed(2);
    console.info(`SUM for ${sheet.getSheetName()} = ${sum} grams`);
    return sum;
  }
  
  SumMaterials () {
    let count = [];
    Object.values(SHEETS).forEach(sheet => count.push(this.SumSingleSheetMaterials(sheet)));
    console.info(count)
    let total = Number(count.reduce((a,b) => Number(a) + Number(b))).toFixed(2);
    console.info(`Total Count of All Materials : ${total}`);
    OTHERSHEETS.Metrics.getRange(`B46`).setValue(`Sum of All Materials (Grams)`);
    OTHERSHEETS.Metrics.getRange(`C46`).setValue(total);
    return total;
  }
  PrintSheetMaterials() {
    let counts = [];
    Object.values(SHEETS).forEach(sheet => counts.push(this.SumSingleSheetMaterials(sheet)));
    console.info(counts);
    OTHERSHEETS.Metrics.getRange(3, 6, 1, 1).setValue(`PLA Used (grams)`);
    for(let i = 0; i < counts.length; i++) {
      OTHERSHEETS.Metrics.getRange(4 + i, 6, 1, 1).setValue(`${counts[i]}`);
    }
   
  }

  SumSingleSheetCost(sheet) {
    let cost = GetColumnDataByHeader(sheet, HEADERNAMES.cost);
    let statuses = GetColumnDataByHeader(sheet, HEADERNAMES.status);
    for(let i = 0; i < cost.length; i++) {
      if(statuses[i] == STATUS.complete.plaintext || statuses[i] == STATUS.closed.plaintext) cost[i] = 0.0;
      if(cost[i] === null || !cost[i] || cost[i] == ' ') cost[i] = 0.0;
    }
    let sum = Number(cost.reduce((a,b) => a + b)).toFixed(2);
    console.info(`SUM for ${sheet.getSheetName()} = $${sum}`);
    return sum;
  }
  SumCosts () {
    let count = [];
    Object.values(SHEETS).forEach(sheet => count.push(this.SumSingleSheetCost(sheet)));
    console.info(count);
    let total = Number(count.reduce((a,b) => Number(a) + Number(b))).toFixed(2);
    console.info(`Total Count of All Funds : $${total}`);
    OTHERSHEETS.Metrics.getRange(`B47`).setValue(`Sum of All Funds Generated ($)`);
    OTHERSHEETS.Metrics.getRange(`C47`).setValue(total);
    return total;
  }
  PrintSheetCosts() {
    let counts = [];
    Object.values(SHEETS).forEach(sheet => counts.push(this.SumSingleSheetCost(sheet)));
    console.info(counts);
    OTHERSHEETS.Metrics.getRange(3, 5, 1, 1).setValue(`Funds Generated ($)`);
    for(let i = 0; i < counts.length; i++) {
      OTHERSHEETS.Metrics.getRange(4 + i, 5, 1, 1).setValue(`$${counts[i]}`);
    }
   
  }
  
}



/**
 * -----------------------------------------------------------------------------------------------------------------
 * Run Metrics
 */
const Metrics = () => {
  const calculate = new Calculate();
  try {
    console.warn(`Calculating Metrics .... `);
    calculate.GetUserCount();
    calculate.PrintTurnarounds();
    calculate.PrintStatusCounts();
    calculate.CountUniqueUsers();
    calculate.CountTotalSubmissions();
    calculate.PrintTopTen();
    calculate.CalculateStandardDeviation();
    calculate.CalculateArithmeticMean();
    calculate.StatusCounts();
    calculate.PrintUniqueUsersWhoHavePrinted();
    calculate.SumMaterials();
    calculate.SumCosts();
    calculate.PrintSheetCosts();
    calculate.PrintSheetMaterials();
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
  const c = new Calculate();
  console.info(c.PrintStatusCounts());
}






