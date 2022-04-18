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
      let last = sheet.getLastRow() ? sheet.getLastRow() : 1;
      let completionTimes = sheet.getRange(2, 8, last, 1).getValues();
      completionTimes = [].concat(...completionTimes); 
      culled = completionTimes.filter(Boolean);
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
    let average = Number.parseFloat(total / culled.length).toFixed(2);
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
    let statuses = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues();
    statuses = [].concat(...statuses);

    let countFunc = (keys) => {
      count[keys] = ++count[keys] || 1;
    }
    statuses.forEach(countFunc);
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
      ratio instanceof Number ? ratio : 0;
      OTHERSHEETS.Metrics.getRange(4 + index, 2, 1, 1).setValue(value.Completed);
      OTHERSHEETS.Metrics.getRange(4 + index, 3, 1, 1).setValue(value.Cancelled);
      OTHERSHEETS.Metrics.getRange(4 + index, 4, 1, 1).setValue(ratio);
    })
  }

  CalculateDistribution () {
    let userList = [];
    for(const [name, sheet] of Object.entries(SHEETS)) { 
      let users = [].concat(...sheet.getRange(2, 6, sheet.getLastRow() -1, 1).getValues());
      users.filter(Boolean);
      users.forEach( user => userList.push(user));
    }
    userList.filter(Boolean);
    let occurrences = userList.reduce( (acc, curr) => {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});
    let items = Object.keys(occurrences).map((key) => {
      if (key != "" || key != undefined || key != null) {
        return [key, occurrences[key]];
      }
    });
    items.sort((first, second) => {
      return second[1] - first[1];
    });
    return items;  
  }

  async CalculateSubmissionDateDistribution ()  {

    let dates = [];
    let report = [];
    const pos = new PrinterOS();
    await pos.Login()
      .then(pos.CheckSession())
      .then( async () => {
        let date = new Date();
        date.setDate(date.getDate() - 90);
        const fromDate = date.toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];
        console.info(`From : ${fromDate}, To : ${toDate}`);
        report = await pos.GetFinishedJobReport(fromDate, toDate);
      })
      .then(() => {
        let sorted = report.sort((a,b) => b.endtime - a.endtime);
        sorted.forEach(item => {
          let date = item["endtime"];
          dates.push(date);
        })
      })
      .then(pos.Logout());

    dates = [].concat(...dates);
    let dateList = [];
    dates.forEach( date => {
      if(date != null || date != undefined || date != "" || IsValidDate(date)) {
        let actualDate = new Date(date);
        let formatted = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDay());
        if(IsValidDate(formatted)) dateList.push(formatted);
      }
    })
    
    let occurrences = dateList.reduce( (acc, curr) => {
      return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
    }, {});
    let items = Object.keys(occurrences).map((key) => {
      if (key != "" || key != undefined || key != null) {
        return [key, occurrences[key]];
      }
    });
    console.info(items);
    items.forEach( (thing, index) => {
      OTHERSHEETS.Metrics.getRange(2 + index, 23, 1, 1).setValue(thing[0]);
      OTHERSHEETS.Metrics.getRange(2 + index, 24, 1, 1).setValue(thing[1]);
    })
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
    users.forEach( (user, index) => {
      OTHERSHEETS.Unique.getRange(2 + index, 1, 1, 1).setValue(user);
    })
    OTHERSHEETS.Metrics.getRange(21, 2, 1, 1).setValue(`Users who have printed`);
    OTHERSHEETS.Metrics.getRange(21, 3, 1, 1).setValue(users.length);
  }

  CountUniqueUsers () {
    const countUnique = (iterable) => {
      return new Set(iterable).size;
    }
    let userList = [];
    for(const [key, sheet] of Object.entries(SHEETS)) { 
      let users = sheet.getRange(2, 6, sheet.getLastRow(), 1).getValues();
      users = [].concat(...users);
      users.forEach( user => userList.push(user));
    }
    
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
    for(const [key, sheet] of Object.entries(SHEETS)) {
      let statuses = sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues();
      statuses = [].concat(...statuses);
      let temp = [];
      statuses.forEach(stat => {
        if(stat != null || stat != undefined || stat != "" || stat != " ") {
          temp.push(stat.split('-').join('').toLowerCase());
        }
      })
      let countFunc = (keys) => {
        count[keys] = ++count[keys] || 1;
      }
      temp.forEach(countFunc);
    }
    console.info(count);
    OTHERSHEETS.Metrics.getRange(25, 2, 1, 1).setValue(`Completed Prints`);
    OTHERSHEETS.Metrics.getRange(25, 3, 1, 1).setValue(count.completed);

    OTHERSHEETS.Metrics.getRange(26, 2, 1, 1).setValue(`Cancelled Prints`);
    OTHERSHEETS.Metrics.getRange(26, 3, 1, 1).setValue(count.cancelled);

    OTHERSHEETS.Metrics.getRange(27, 2, 1, 1).setValue(`In-Progress Prints`);
    OTHERSHEETS.Metrics.getRange(27, 3, 1, 1).setValue(count.inprogress);

    OTHERSHEETS.Metrics.getRange(28, 2, 1, 1).setValue(`Queued Prints`);
    OTHERSHEETS.Metrics.getRange(28, 3, 1, 1).setValue(count.queued);
  }

  

  CountUniqueUsersWhoHavePrinted () {
    const countUnique = (iterable) => {
      return new Set(iterable);
    }
    let userList = [];
    for(const [key, sheet] of Object.entries(SHEETS)) {
      let status = [].concat(...sheet.getRange(2, 1, sheet.getLastRow(), 1).getValues()); 
      let users = [].concat(...sheet.getRange(2, 6, sheet.getLastRow(), 1).getValues());
      status.forEach( (stat, index) => {
        if(stat == STATUS.complete.plaintext) userList.push(users[index])
      });
    }
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

    let standardDeviation = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
    console.info(`Standard Deviation for Number of Submissions : ${standardDeviation}`);

    OTHERSHEETS.Metrics.getRange(43, 2, 1, 1).setValue(`Standard Deviation for Number of Submissions per User`);
    OTHERSHEETS.Metrics.getRange(43, 3, 1, 1).setValue(standardDeviation);
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
    OTHERSHEETS.Metrics.getRange(44, 3, 1, 1).setValue(mean);
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
  const calculate = new Calculate();
  const d = calculate.PrintTopTen();
  console.info(d);
}






