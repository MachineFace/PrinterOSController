/**
 * ----------------------------------------------------------------------------------------------------------------
 * Design Specialist Class function 
 * @param {string} name
 * @param {string} fullname
 * @param {string} email
 */
/**
 * ----------------------------------------------------------------------------------------------------------------
 * Design Specialist Class
 */
class DesignSpecialist
{
  constructor({
    name = "Default FirstName", 
    fullname = "FirstName LastName", 
    email = "somename@place.com"
  }){
    this.name = name;
    this.fullname = fullname;
    this.email = email;
    this.type = 'Design Specialist';
    this.admin = true;
    this.link = MakeLink(this.email)
  }
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * SS Class - child of DS Class
 */
class StudentSupervisor extends DesignSpecialist
{
  constructor({
    name = "Default FirstName", 
    fullname = "FirstName LastName", 
    email = "somename@place.com"
  }){
    // The reserved 'super' keyword is for making super-constructor calls and allows access to parent methods.
    super({name, fullname, email});
    // Note: In derived classes, super() must be called before you can use 'this'. Leaving this out will cause a reference error.
    this.name = name;
    this.fullname = fullname;
    this.email = email;
    this.type = 'Student Supervisor';
    this.admin = false;
    this.link = MakeLink(this.email)
  }

}


/**
 * ----------------------------------------------------------------------------------------------------------------
 * Manager Class - child of DS Class
 */
class Manager extends DesignSpecialist 
{ 
  constructor({
    name = "Default FirstName", 
    fullname = "FirstName LastName", 
    email = "somename@place.com"
  }){
    super({name, fullname, email});
    this.name = name;
    this.fullname = fullname;
    this.email = email;
    this.type = 'Manager';
    this.admin = true;
    this.link = MakeLink(this.email)
  }
}



/**
 * ----------------------------------------------------------------------------------------------------------------
 * Turn an email address into a link
 * @param {string} email
 * @returns {string} link
 */
const MakeLink = (email) => '<a href="mailto:' + email + '">' + email + '</a>';




/**
 * ----------------------------------------------------------------------------------------------------------------
 * Invoke Design Specialist properties
 * @param {string} name
 * @param {string} property
 * @returns {string} fullname, email, or email link
 */
const Staff = () => {
  const staffSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`StaffList`);
  const data = staffSheet.getRange(2, 1, staffSheet.getLastRow() -1, 5).getValues();

  let staff = {};
  data.forEach( (item,index) => {
    let name = item[0], fullname = item[1], email = item[2], emaillink = item[3], type = item[4];
    // Logger.log(`Name : ${name}, FullName : ${fullname}, Email : ${email}, Link : ${emaillink}, Type : ${type}`)
    if(type === 'DS') {
      staff[name] = new DesignSpecialist({name : name, fullname : fullname, email : email})
      // objs.push(new DesignSpecialist({name : name, fullname : fullname, email : email}))
    }
    if(type === 'SS') {
      staff[name] = new StudentSupervisor({name : name, fullname : fullname, email : email})
    }
    if(type === 'MA') {
      staff[name] = new Manager({name : name, fullname : fullname, email : email})
    }
  })
  // Logger.log(staff)
  return staff;
}


/**
 * Unit test for making Staff
 */
const _test = () => {
  const staff = Staff();
  Logger.log(staff["Adam"]["email"])
  Logger.log(staff["Cody"])
}

