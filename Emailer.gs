/**
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
class Emailer {
  constructor({ 
    email : email, 
    name : name = `Self-Service Printing User`,
    status : status = STATUS.queued.plaintext,
    projectname : projectname = `Your Project Name`,
    jobnumber : jobnumber = 1000000001,
    weight : weight = 0.0,
    designspecialist : designspecialist = `Cody Glen`,
    designspecialistemail : designspecialistemail = `codyglen@berkeley.edu`,
    designspecialistemaillink : designspecialistemaillink = `<a href="codyglen@berkeley.edu">codyglen@berkeley.edu</a>`, 
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
    this.message = new CreateMessage({
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
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Queued`, "", {
          htmlBody: this.message.queuedMessage,
          from: SERVICE_EMAIL,
          cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
          bcc: "",
          name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.inProgress.plaintext:
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Project Started`, "", {
            htmlBody: this.message.inProgressMessage,
            from: SERVICE_EMAIL,
            cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
            bcc: "",
            name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.complete.plaintext:
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Project Completed`, "", {
            htmlBody: this.message.completedMessage,
            from: SERVICE_EMAIL,
            cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
            bcc: "",
            name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.failed.plaintext:
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Project has Failed`, "", {
            htmlBody: this.message.failedMessage,
            from: SERVICE_EMAIL,
            cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
            bcc: "",
            name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.cancelled.plaintext:
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Project has been Cancelled`, "", {
            htmlBody: this.message.cancelledMessage,
            from: SERVICE_EMAIL,
            cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
            bcc: "",
            name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.closed.plaintext:
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Project Closed`, "", {
          htmlBody: this.message.completedMessage,
          from: SERVICE_EMAIL,
            cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
          bcc: "",
          name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.abandoned.plaintext:
        MailApp.sendEmail(this.email, `${SERVICE_NAME} : Project hasn't been picked up yet!`, "", {
          htmlBody: this.message.abandonedMessage,
          from: SERVICE_EMAIL,
            cc: `${this.designspecialistemail}, ${SERVICE_EMAIL}`,
          bcc: "",
          name: SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case "":
      case undefined:
        console.warn(`Student ${this.name} NOT emailed...`);
        break;
    }
  }

}


const _testEmailer = () => {
  Object.values(STATUS).forEach(async (status) => {
    await new Emailer({
      email : "codyglen@berkeley.edu",
      status : status.plaintext,
      name : `Dingus Dongus`,
      projectname : `Dingus Project`,
      jobnumber : 9234875,
      weight : 200,
    })
  })
}














