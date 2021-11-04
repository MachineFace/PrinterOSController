/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Creating Response Messages
 * Properties accessed via 'this.receivedMessage' or 'this.failedMessage'
 * @param {string} name
 * @param {string} projectname
 * @param {number} jobnumber
 * @param {string} approvalURL
 * @param {number} material1Quantity
 * @param {number} material2Quantity
 * @param {string} designspecialist
 * @param {string} designspecialistemaillink
 */
class CreateMessage {
    constructor({
      name = `Student Name`, 
      projectname = `Project Name`, 
      jobnumber = `Job Number`, 
      material1Quantity = 0, 
      material2Quantity = 0,
      designspecialist = `Design Specialist`, 
      designspecialistemaillink = `Link`
    }){
      this.name = name;
      this.projectname = projectname;
      this.jobnumber = jobnumber;

      this.material1Quantity = material1Quantity;
      this.material2Quantity = material2Quantity;

      this.designspecialist = designspecialist;
      this.designspecialistemaillink = designspecialistemaillink;
      this.staff = new StaffBuilder().get();
    }
    get defaultMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for applying to Jacobs Project Support.<br/><br/>';
        message += 'A Design Specialist is reviewing you application, and will respond to you shortly.<br/><br/>';
        message += 'If you have questions or need assistance please email ' + this.email + '. <br/></p>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>'; 
      return message; 
    }
    get receivedMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'Your project, <b><i>' + this.projectname + '</i></b> has been received.<br/>';
        message += 'Your part or parts have been assigned a job number: <i>' + this.jobnumber + '</i>.<br/>';
        message += 'If you have questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += 'We will update you when it has been started by a staff member.</p>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get pendingMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support. Your project is awaiting an approval or rejection from you. <br />';
        message += 'Your project: <b><i>' + this.projectname + '</i></b> with the job number <i>' + this.jobnumber + '</i>, can be approved or rejected by clicking this link and approving or rejecting:';
        message += 'Pending approval, your Jacobs Store account will be billed for: <br/> ';
        message += '<p><ul>'; //start bulletpoint list
        message += '<li>' + this.material1Quantity + ' of PLA </li>';  
        message += '<li>' + this.material2Quantity + ' of Breakaway Support </li>';  
        message += '</ul>';     // end bulletpoint list
        message += '</p><br/>';
        message += 'If you have questions or need assistance please email ' + this.staff["Staff"]["link"] + '.<br/>';
        message += '. <br />We will update you when it has been started.</p>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get inProgressMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support. Your project has started. <br />';
        message += 'Your job number: <i>' + this.jobnumber + '</i>.<br/>';
        message += 'The part or parts requested for your project, <b><i>' + this.projectname + '</i></b> has been started by ' + this.designspecialist + '.<br/>';
        message += 'Please email ' + this.designspecialistemaillink + ' for further details.<br/>';
        message += 'If you have questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<br />We will update you when it is done.</p>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get completedMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'The part or parts requested for your project, <b><i>' + this.projectname + '</i></b> are finished. Job Number: <i>' + this.jobnumber + '</i><br />';
        message += 'Your parts are now available for pickup.<br />';
        message += 'Please email ' + this.designspecialist + ' at ' + this.designspecialistemaillink + ' for further details.<br/>';
        message += 'Your Jacobs Store account will be billed for: <br/> ';
        message += '<p><ul>';
        message += '<li>' + this.material1Quantity + ' of PLA </li>';  
        message += '<li>' + this.material2Quantity + ' of Breakaway Support </li>';  
        message += '</ul>';     // dont forget to end the bullet point list (unordered list)
        message += '<br/><p>';
        message += 'Completed projects can be picked up in-person, unless otherwise noted with your instructor.<br/><br/>';
        message += '<b>Pick-Up Location:<br/>';
        message += '<a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall : LeRoy Ave Main Entrance <br/>'; 
        message += '2530 Ridge Rd, Berkeley, CA 94709</a><br/><br/></b>';
        message += '<b>Pick-Up Hours:<br/>';
        message += 'Monday - Friday: 11am - 1pm</b><br/><br/>'
        message += 'If you have any further questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Please take a moment to take our survey so we can improve JPS : '
        message += '<a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a></p><br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>'; 
      return message;
    }
    get pickedUpMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'The part or parts requested for your project, <b><i>' + this.projectname + '</i></b> have been picked up. Job Number: <i>' + this.jobnumber + '</i><br />';
        message += 'Please email ' + this.designspecialist + ' at ' + this.designspecialistemaillink + ' if you have any additional questions.<br/>';
        message += '<p>Please take a moment to take our survey so we can improve JPS : '
        message += '<a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a></p><br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>'; 
      return message;
    }
    get shippingQuestion() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'You have requested shipping for your part <b><i>' + this.projectname + '</i></b>. Job Number: <i>' + this.jobnumber + '</i><br/>';
        message += 'In order to send your parts to you, please fill out this form:<br />';
        message += '<a href="https://docs.google.com/forms/d/e/1FAIpQLSdgk5-CjHOWJmAGja3Vk7L8a7ddLwTsyJhGicqNK7G-I5RjIQ/viewform"><b>Shipping Form</b></a>';
        message += 'Please contact ' + this.designspecialist + ' for more information: ' + this.designspecialistemaillink + 'for further details.<br/>';
        message += 'If you have any questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get shippedMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'The part or parts requested for your project, <b><i>' + this.projectname + '</i></b> are finished. Job Number: <i>' + this.jobnumber + '</i><br/>';
        message += 'Your parts will be shipped shortly.<br />';
        message += 'Please contact ' + this.designspecialist + ' for more information: ' + this.designspecialistemaillink + 'for further details.<br/>';
        message += 'If you have any questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get failedMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'Your project, <b><i>' + this.projectname + '</i></b> has unfortunately failed. Job Number: <i>' + this.jobnumber + '</i><br /><br />';
        message += 'Please contact ' + this.designspecialist + ' for more information: ' + this.designspecialistemaillink + '<br /><br />';
        message += 'If you have any questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get rejectedByStudentMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'You have elected not to proceed with the design process. Job Number: <i>' + this.jobnumber + '</i><br /><br />';
        message += 'Please contact ' + this.designspecialist + ' for more information, or if you believe this to be an error: ' + this.designspecialistemaillink + '<br /><br />';
        message += 'If you have any questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get rejectedByStaffMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'A staff member has cancelled and/or declined this job with the Project Name: <b><i>' + this.projectname + '</b></i>. Job Number: <i>' + this.jobnumber + '</i><br /><br />';
        message += 'Please contact ' + this.designspecialist + ' for more information, or if you believe this to be an error: ' + this.designspecialistemaillink + '<br /><br />';
        message += 'You may also choose to resubmit this job as a new submission.<br/>';
        message += 'If you have any questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';;
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get waitlistMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support.<br />';
        message += 'Your project, <b><i>' + this.projectname + '</i></b> has been temporarily waitlisted. ';
        message += 'You will be notified when your job starts. Job Number: <b><i>' + this.jobnumber + '</i></b><br /><br />';
        message += 'Please contact ' + this.designspecialist + ' for more information: ' + this.designspecialistemaillink + '. No action is required at this time.<br /><br />';
        message += 'If you have any questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get billedMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support. Your project <b><i>' + this.projectname + '</b></i> is now <b>CLOSED.</b><br />';
        message += 'Job Number: <i>' + this.jobnumber + '</i>. Your Jacobs Store account has been billed for: <br/> ';
        message += '<p><ul>';
        message += '<li>' + this.material1Quantity + ' of PLA </li>';  
        message += '<li>' + this.material2Quantity + ' of Breakaway Support </li>';  
        message += '</ul>';     // dont forget to end the bullet point list (unordered list)
        message += '<br/>';
        message += 'If you have not picked up your parts, they can be picked up in-person.<br/><br/>';
        message += 'If you have any further questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '<p>Please take a moment to take our survey so we can improve JPS : <a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a></p><br/>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
    get noAccessMessage() {
      let message = '<p>Hi ' + this.name + ',</p>';
        message += '<p>Thank you for choosing Jacobs Project Support. ';
        message += 'Your project: <b><i>' + this.projectname + '</i></b> has been prevented from advancing until we have received confirmation of your approval. <br/><br/>';
        message += 'DES INV and affiliated courses students are approved automatically upon registration submission. '; 
        message += 'Researchers are added when we receive IOC payment approval from their PI. '; 
        message += 'Researchers are urged to contact their PI to ensure they have appropriate approval.<br/>';
        message += 'Information on how to gain access can be found at <a href="makerspace.jacobshall.org"><b>Here</b></a><br/><br/>';
        message += 'Please register if you have not done so yet: <br/>';
        message += '<a href="https://jacobsaccess.ist.berkeley.edu/jps/signup"><b>Registration</b></a> <br/><br/>';
        message += '</p>';
        message += 'If you have questions or need assistance please email ' + this.staff["Staff"]["link"] + '. <br/>';
        message += '. <br />Once your registration has been updated, or your PI has fixed the issue, we will update you when your project has been started.</p>';
        message += '<p>Best,<br />Jacobs Hall Staff</p>';
      return message;
    }
}




/**
 * -----------------------------------------------------------------------------------------------------------------
 * Unit Test for Making 'OnEdit' Messages
 */
const _testMessages = async () => {
  const message = new CreateMessage({
    name : 'Stu Dent',
    projectname : 'Pro Ject',
    jobnumber : new JobNumberGenerator({}).GenerateJobNumber(),
    material1Quantity : 500,
    material2Quantity : 35,
    designspecialist : `Mike Spec`,
    designspecialistemaillink : `LinkyLink`
  })


    Logger.log('DEFAULT' + message.defaultMessage);
    Logger.log('RECEIVED' + message.receivedMessage);
    Logger.log('PENDING' + message.pendingMessage);
    Logger.log('IN-PROGRESS' + message.inProgressMessage);
    Logger.log('COMPLETED' + message.completedMessage);
    Logger.log('PICKEDUP' + message.pickedUpMessage);
    Logger.log('SHIPPING QUESTION' + message.shippingQuestion);
    Logger.log('SHIPPED' + message.shippedMessage);
    Logger.log('FAILED' + message.failedMessage);
    Logger.log('REJECTED' + message.rejectedByStudentMessage);
    Logger.log('BILLED' + message.billedMessage);

    return await message;

  // const message = new CreateMessage({});
  // Logger.log('DEFAULT' + message.defaultMessage);
  // Logger.log('RECEIVED' + message.receivedMessage);
  // Logger.log('PENDING' + message.pendingMessage);
  // Logger.log('IN-PROGRESS' + message.inProgressMessage);
  // Logger.log('COMPLETED' + message.completedMessage);
  // Logger.log('PICKEDUP' + message.pickedUpMessage);
  // Logger.log('SHIPPING QUESTION' + message.shippingQuestion);
  // Logger.log('SHIPPED' + message.shippedMessage);
  // Logger.log('FAILED' + message.failedMessage);
  // Logger.log('REJECTED' + message.rejectedByStudentMessage);
  // Logger.log('BILLED' + message.billedMessage);
}



