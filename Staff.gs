
/**
 * ----------------------------------------------------------------------------------------------------------------
 * Class for Creating a Design Specialist Employee
 */
class DesignSpecialist
{
  constructor({
    name = `DS`, 
    fullname = `Design Specialist`, 
    email = `jacobsprojectsupport@berkeley.edu`
  }) {
    this.name = name;
    this.fullname = fullname;
    this.email = email;
    this.link = `<a href="${this.email}">${this.email}</a>`;
    this.type = `Design Specialist`;
    this.isAdmin = true;
    this.shortCode = `DS`;
  }
  
  get() {
    return {
      name : this.name,
      fullname : this.fullname,
      email : this.email,
      link : this.link,
      type : this.type,
      isAdmin : this.isAdmin,
      shortCode : this.shortCode,
    }
  }

}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * SS Class - child of DS Class
 * Note: In derived classes, super() must be called before you can use 'this'. Leaving this out will cause a reference error.
 */
class StudentSupervisor extends DesignSpecialist
{
  constructor({
    name = `SS`, 
    fullname = `Student Supervisor`, 
    email = `jacobsprojectsupport@berkeley.edu`
  }) {
    // The reserved 'super' keyword is for making super-constructor calls and allows access to parent methods.
    super(name, fullname, email);
    this.name = name;
    this.fullname = fullname;
    this.email = email;
    this.link = `<a href="${this.email}">${this.email}</a>`;
    this.type = 'Student Supervisor';
    this.isAdmin = false;
    this.shortCode = `SS`;
  }

  get() {
    return {
      name : this.name,
      fullname : this.fullname,
      email : this.email,
      link : this.link,
      type : this.type,
      isAdmin : this.isAdmin,
      shortCode : this.shortCode,
    }
  }

}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Manager Class - child of DS Class
 */
class Manager extends DesignSpecialist 
{ 
  constructor({
    name = `MA`, 
    fullname = `Manager`, 
    email = `jacobsprojectsupport@berkeley.edu`
  }) 
  {
    super(name, fullname, email);
    this.name = name;
    this.fullname = fullname;
    this.email = email;
    this.link = `<a href="${this.email}">${this.email}</a>`;
    this.type = 'Manager';
    this.isAdmin = true;
    this.shortCode = `MA`;
  }

  get() {
    return {
      name : this.name,
      fullname : this.fullname,
      email : this.email,
      link : this.link,
      type : this.type,
      isAdmin : this.isAdmin,
      shortCode : this.shortCode,
    }
  }
  
}



/**
 * ----------------------------------------------------------------------------------------------------------------
 * Create a Design Specialist from spreadsheet and return a list
 * @returns {[string]} DSList
 */
const BuildStaff = () => {
  let staff = {};
  let range = OTHERSHEETS.Staff.getRange(2, 1, OTHERSHEETS.Staff.getLastRow() - 1, 5).getValues();
  let culled = range.filter(Boolean);

  culled.forEach( (row, index) => {
    let name = row[0];
    let fullname = row[1];
    let email = row[2];
    let link = row[3];
    let type = row[4];
    // console.info(`Name : ${name}, Full : ${fullname}, Email : ${email}, Link : ${link}`);
    if(email && !link) {
      link = `<a href = "${email}">${email}</a>`;
      OTHERSHEETS.Staff.getRange(OTHERSHEETS.Staff.getLastRow() - 1, 4).setValue(link);
    }
    if(type == "DS") {
      let ds = new DesignSpecialist({
        name : name, 
        fullname : fullname, 
        email : email
      });
      staff[name] = ds;
    } else if(type == "MA") {
      let ma = new Manager({
        name : name, 
        fullname : fullname, 
        email : email
      });
      staff[name] = ma;
    } else if(type == "SS") {
      let ss = new StudentSupervisor({
        name : name, 
        fullname : fullname, 
        email : email
      });
      staff[name] = ss;
    }
  });
  console.info(staff);
  return staff;
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Return Staff Email as a string.
 */
const StaffEmailAsString = () => {
  let emaillist = OTHERSHEETS.staff.getRange(2, 3, OTHERSHEETS.staff.getLastRow() - 1, 1).getValues();
  return emaillist.toString();
}





/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Building Staff
 */
class StaffBuilder
{
  constructor() {
    this.staff = {};
    this.MakeStaff();
  }

  MakeStaff () {
    const data = OTHERSHEETS.Staff.getRange(2, 1, OTHERSHEETS.Staff.getLastRow() -1, 5).getValues();
    data.forEach( item => {
      let name = item[0], fullname = item[1], email = item[2], emaillink = item[3], type = item[4];
      if(type === 'DS') this.staff[name] = new DesignSpecialist({name : name, fullname : fullname, email : email});
      if(type === 'SS') this.staff[name] = new StudentSupervisor({name : name, fullname : fullname, email : email});
      if(type === 'MA') this.staff[name] = new Manager({name : name, fullname : fullname, email : email});
    });
  }

  get () {
    return this.staff;
  }

}



/**
 * Unit test for making Staff
 */
const _test = () => {
  const staff = new StaffBuilder().get();
  for(const [name, values] of Object.entries(staff)) {
    console.info(`${name} ----> First Name :${values.name}, Full : ${values.fullname} ~~ ${JSON.stringify(values)}`)
  }
  const cody = staff["Cody"];
  console.info(cody)
}

