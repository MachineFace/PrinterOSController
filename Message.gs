/**
 * -----------------------------------------------------------------------------------------------------------------
 * Class for Creating Response Messages
 * Properties accessed via 'this.receivedMessage' or 'this.failedMessage'
 * @param {string} name
 * @param {string} projectname
 * @param {number} jobnumber
 * @param {string} approvalURL
 * @param {number} weight
 * @param {string} designspecialist
 * @param {string} designspecialistemaillink
 */
class CreateMessage {
  constructor({
    name : name = `${GMAIL_SERVICE_NAME} User`, 
    projectname : projectname = `Project Name`, 
    jobnumber : jobnumber = 1000001, 
    weight : weight = 0.0, 
    designspecialist : designspecialist = `Staff`, 
    designspecialistemaillink : designspecialistemaillink = `url`,
  }){
    /** @private */
    this.name = name;
    /** @private */
    this.projectname = projectname;
    /** @private */
    this.jobnumber = jobnumber;
    /** @private */
    this.weight = weight;
    /** @private */
    this.designspecialist = designspecialist;
    /** @private */
    this.designspecialistemaillink = designspecialistemaillink;
    /** @private */
    this.staff = new StaffBuilder().get();
  }
  get defaultMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for applying to Jacobs Project Support.<br/><br/>`;
      message += `A Design Specialist is reviewing you application, and will respond to you shortly.<br/><br/>`;
      message += `If you have questions or need assistance please email ${this.email}. <br/></p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message; 
  }
  get queuedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support.<br />`;
      message += `Your project, <b><i>${this.projectname}</i></b> has been received.<br/>`;
      message += `Your part or parts have been assigned a job number: <i>${this.jobnumber}</i>.<br/>`;
      message += `If you have questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `We will update you when it has been started by a staff member.</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get inProgressMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support. Your project has started. <br />`;
      message += `Your job number: <i>${this.jobnumber}</i>.<br/>`;
      message += `The part or parts requested for your project, <b><i>${this.projectname}</i></b> has been started by ${this.designspecialist}.<br/>`;
      message += `Please email ${this.designspecialistemaillink} for further details.<br/>`;
      message += `If you have questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<br />We will update you when it is done.</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get completedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support.<br />`;
      message += `The part or parts requested for your project, <b><i>${this.projectname}</i></b> are finished. Job Number: <i>${this.jobnumber}</i><br />`;
      message += `Your parts are now available for pickup.<br />`;
      message += `Please email ${this.designspecialist} at ${this.designspecialistemaillink} for further details.<br/>`;
      message += `Your Jacobs Store account will be billed for: <br/> `;
      message += `<p><ul>`;
      message += `<li>${this.weight} grams of PLA </li>`;  
      message += `</ul>`;     // dont forget to end the bullet point list (unordered list)
      message += `<br/><p>`;
      message += `Completed projects can be picked up in-person, unless otherwise noted with your instructor.<br/><br/>`;
      message += `<b>Pick-Up Location:<br/>`;
      message += `<a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall : LeRoy Ave Main Entrance <br/>`; 
      message += `2530 Ridge Rd, Berkeley, CA 94709</a><br/><br/></b>`;
      message += `<b>Pick-Up Hours:<br/>`;
      message += `${PICKUPHOURS}</b><br/><br/>`;
      message += `If you have any further questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<p>Please take a moment to take our survey so we can improve JPS : `;
      message += `<a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a></p><br/>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get pickedUpMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support.<br />`;
      message += `The part or parts requested for your project, <b><i>${this.projectname}</i></b> have been picked up. Job Number: <i>${this.jobnumber}</i><br />`;
      message += `Please email ${this.designspecialist} at ${this.designspecialistemaillink} if you have any additional questions.<br/>`;
      message += `<p>Please take a moment to take our survey so we can improve JPS : `
      message += `<a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a></p><br/>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get abandonedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support.<br />`;
      message += `The part or parts requested for your project, <b><i>${this.projectname}</i></b> are finished and have not been picket up yet. Job Number: <i>${this.jobnumber}</i><br />`;
      message += `<font style="color:#FF0000";><b>Please pick up your parts SOON before they are disposed of in the free-prints bin.</b></font><br />`;
      message += `Please email ${this.designspecialist} at ${this.designspecialistemaillink} if you have questions or concerns.<br/>`;
      message += `Completed projects can be picked up in-person.<br/><br/>`;
      message += `<b>Pick-Up Location:<br/>`;
      message += `<a href="https://www.google.com/maps/d/edit?mid=19_zxiFYyxGysWTUDnMZl27gPX9b--2gz&usp=sharing">Jacobs Hall LeRoy Ave. Main Entrance - Room 234 / Lobby. <br/>`; 
      message += `2530 Ridge Rd, Berkeley, CA 94709</a><br/><br/></b>`;
      message += `<b>Pick-Up Hours:<br/>`;
      message += `${PICKUPHOURS}</b><br/><br/>`
      message += `If you have any further questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<p>Please take a moment to take our survey so we can improve JPS : `
      message += `<a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a></p><br/>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`; 
    return message;
  }
  get cancelledMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support.<br />`;
      message += `Your project has been cancelled and/or declined. Project Name: <b><i>${this.projectname}</b></i>. Job Number: <i>${this.jobnumber}</i><br /><br />`;
      message += `Please contact ${this.designspecialist} for more information, or if you believe this to be an error: ${this.designspecialistemaillink}<br /><br />`;
      message += `You may also choose to resubmit this job as a new submission.<br/>`;
      message += `If you have any questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get failedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support.<br />`;
      message += `Your project, <b><i>${this.projectname}</i></b> has unfortunately failed. Job Number: <i>${this.jobnumber}</i><br /><br />`;
      message += `Please contact ${this.designspecialist} for more information: ${this.designspecialistemaillink}<br /><br />`;
      message += `If you have any questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get billedMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support. Your project <b><i>${this.projectname}</b></i> is now <b>CLOSED.</b><br />`;
      message += `Job Number: <i>${this.jobnumber}</i>. Your Jacobs Store account has been billed for: <br/>`;
      message += `<p><ul>`;
      message += `<li>${this.weight} grams of PLA </li>`;  
      message += `</ul>`;     // dont forget to end the bullet point list (unordered list)
      message += `<br/>`;
      message += `If you have not picked up your parts, they can be picked up in-person.<br/><br/>`;
      message += `If you have any further questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<p>Please take a moment to take our survey so we can improve JPS : `; 
      message += `<a href="https://docs.google.com/forms/d/e/1FAIpQLSe_yCGqiGa4U51DodKWjOWPFt-ZfpxGUwaAYJqBV0GZ0q_IUQ/viewform">Take Survey</a>`;
      message += `</p><br/>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
  get noAccessMessage() {
    let message = `<p>Hi ${this.name},</p>`;
      message += `<p>Thank you for choosing Jacobs Project Support. `;
      message += `Your project: <b><i>${this.projectname}</i></b> has been prevented from advancing until we have received confirmation of your approval. <br/><br/>`;
      message += `DES INV and affiliated courses students are approved automatically upon registration submission. `; 
      message += `Researchers are added when we receive IOC payment approval from their PI. `; 
      message += `Researchers are urged to contact their PI to ensure they have appropriate approval.<br/>`;
      message += `Information on how to gain access can be found at <a href="makerspace.jacobshall.org"><b>Here</b></a><br/><br/>`;
      message += `Please register if you have not done so yet: <br/>`;
      message += `<a href="https://jacobsaccess.ist.berkeley.edu/jps/signup"><b>Registration</b></a> <br/><br/>`;
      message += `</p>`;
      message += `If you have questions or need assistance please email ${this.staff["Staff"]["link"]}. <br/>`;
      message += `<br />Once your registration has been updated, or your PI has fixed the issue, we will update you when your project has been started.</p>`;
      message += `<p>Best,<br />Jacobs Hall Staff</p>`;
    return message;
  }
}








