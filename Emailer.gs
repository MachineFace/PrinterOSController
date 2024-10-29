/**
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
class EmailService {
  constructor({ 
    email : email, 
    name : name = `Self-Service Printing User`,
    status : status = STATUS.queued.plaintext,
    projectname : projectname = `Your Project Name`,
    jobnumber : jobnumber = 1000000001,
    weight : weight = 0.0,
    designspecialist : designspecialist = `Staff`,
    designspecialistemail : designspecialistemail = SERVICE_EMAIL,
    designspecialistemaillink : designspecialistemaillink = `<a href="${SERVICE_EMAIL}">${SERVICE_EMAIL}</a>`, 
  }) {
    /** @private */
    this.email = email;
    /** @private */
    this.name = name;
    /** @private */
    this.status = status;
    /** @private */
    this.projectname = projectname;
    /** @private */
    this.jobnumber = jobnumber;
    /** @private */
    this.weight = weight;
    /** @private */
    this.designspecialistemail = designspecialistemail;
    /** @private */
    this.message = new MessageService({
      name : this.name,
      projectname : this.projectname,
      jobnumber : this.jobnumber,
      weight : this.weight,
      designspecialist : designspecialist,
      designspecialistemaillink : designspecialistemaillink,
    });
    /** @private */
    this.SendEmail();
  }

  SendEmail() {
    switch (this.status) {
      case STATUS.queued.plaintext:
        EmailService.Mail(this.email, STATUS.queued.plaintext, this.message.queuedMessage, this.designspecialistemail);
        break;
      case STATUS.inProgress.plaintext:
        EmailService.Mail(this.email, STATUS.inProgress.plaintext, this.message.inProgressMessage, this.designspecialistemail);
        break;
      case STATUS.complete.plaintext:
        EmailService.Mail(this.email, STATUS.complete.plaintext, this.message.completedMessage, this.designspecialistemail);
        break;
      case STATUS.failed.plaintext:
        EmailService.Mail(this.email, STATUS.failed.plaintext, this.message.failedMessage, this.designspecialistemail);
        break;
      case STATUS.cancelled.plaintext:
        EmailService.Mail(this.email, STATUS.cancelled.plaintext, this.message.cancelledMessage, this.designspecialistemail);
        break;
      case STATUS.closed.plaintext:
        EmailService.Mail(this.email, STATUS.closed.plaintext, this.message.completedMessage, this.designspecialistemail);
        break;
      case STATUS.abandoned.plaintext:
        EmailService.Mail(this.email, STATUS.abandoned.plaintext, this.message.abandonedMessage, this.designspecialistemail);
        break;
      case "":
      case undefined:
        console.warn(`Student ${this.name} NOT emailed...`);
        break;
    }
  }

  /**
   * Mail
   * @param {string} to email
   * @param {string} status
   * @param {string} message
   * @param {string} bcc email
   * @returns {bool} success
   */
  static Mail(to_email = ``, status = STATUS.queued, message = new MessageService({}), ds_email = ``) {
    try {
      const subject = `${SERVICE_NAME}: ${status}`;
      const options = {
        htmlBody: message,
        from: SERVICE_EMAIL,
        cc: `${ds_email}, ${SERVICE_EMAIL}`,
        bcc: "",
        name: SERVICE_NAME,
        noReply : true,
      }
      MailApp.sendEmail(to_email, subject, "", options);
      console.warn(`User (${to_email}) emailed ${status} message.`);
      return 0;
    } catch(err) {
      console.error(`"Mail()" failed: ${err}`);
      return 1;

    }
  }

}


const _testEmailer = () => {
  Object.values(STATUS).forEach(async (status) => {
    await new EmailService({
      email : "codyglen@berkeley.edu",
      status : status.plaintext,
      name : `Dingus Dongus`,
      projectname : `Dingus Project`,
      jobnumber : 9234875,
      weight : 200,
    })
  })
}














