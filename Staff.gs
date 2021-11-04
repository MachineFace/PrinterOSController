
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
    this.link = '<a href = "' + this.email + '">' + this.email + '</a>';
    this.type = 'Design Specialist';
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
    this.link = '<a href = "' + this.email + '">' + this.email + '</a>';
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
    this.link = '<a href = "' + this.email + '">' + this.email + '</a>';
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
 * Return Staff Email as a string.
 */
const StaffEmailAsString = () => {
  let emaillist = OTHERSHEETS.staff.getRange(2, 3, OTHERSHEETS.staff.getLastRow() - 1, 1).getValues();
  return emaillist.toString();
}


/**
 * -----------------------------------------------------------------------------------------------------------------
 * Invoke Design Specialist properties
 * @param {string} name
 * @param {string} property
 * @returns {string} fullname, email, or email link
 */
const Staff = () => {
  const data = OTHERSHEETS.Staff.getRange(2, 1, OTHERSHEETS.Staff.getLastRow() -1, 5).getValues();

  let staff = {};
  data.forEach( (item,index) => {
    let name = item[0], fullname = item[1], email = item[2], emaillink = item[3], type = item[4];
    if(type === 'DS') staff[name] = new DesignSpecialist({name : name, fullname : fullname, email : email});
    if(type === 'SS') staff[name] = new StudentSupervisor({name : name, fullname : fullname, email : email});
    if(type === 'MA') staff[name] = new Manager({name : name, fullname : fullname, email : email});
  })
  return staff;
}


/**
 * Unit test for making Staff
 */
const _test = () => {
  const staff = Staff();
  Logger.log(JSON.stringify(staff))
  Logger.log(staff["Adam"]["email"])
  Logger.log(staff["Cody"])
}

