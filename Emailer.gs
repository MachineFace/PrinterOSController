/**
 * Send an Email
 * @required {string} Student Email
 * @required {string} Status
 */
class Emailer
{
  constructor({ 
    email : email, 
    status : status,
    name : name,
    projectname : projectname,
    jobnumber : jobnumber,
    weight : weight,
    designspecialist :designspecialist,
    designspecialistemail : designspecialistemail,
    designspecialistemaillink : designspecialistemaillink, 
  }) {
    this.designspecialistemail = designspecialistemail ? designspecialistemail : `codyglen@berkeley.edu`;
    this.email = email ? email : ``;
    this.status = status ? status : STATUS.queued.plaintext;

    this.name = name ? name : `Self-Service Printing User`;
    this.projectname = projectname ? projectname : `Your Project Name`;
    this.jobnumber = jobnumber ? jobnumber : 1000000001;
    this.weight = weight ? weight : 0.0;

    this.message = new CreateMessage({
      name : this.name,
      projectname : this.projectname,
      jobnumber : this.jobnumber,
      weight : this.weight,
      designspecialist : designspecialist ? designspecialist : `Cody Glen`,
      designspecialistemaillink : designspecialistemaillink ? designspecialistemaillink : `<a href="${this.designspecialistemail}">${this.designspecialistemail}</a>`,
    });
    this.SendEmail();
  }

  SendEmail () {
    switch (this.status) {
      case STATUS.queued.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Queued`, "", {
          htmlBody: this.message.queuedMessage,
          from: SUPPORT_ALIAS,
          cc: this.designspecialistemail,
          bcc: "",
          name: GMAIL_SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.inProgress.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Project Started`, "", {
            htmlBody: this.message.inProgressMessage,
            from: SUPPORT_ALIAS,
            cc: this.designspecialistemail,
            bcc: "",
            name: GMAIL_SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.complete.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Project Completed`, "", {
            htmlBody: this.message.completedMessage,
            from: SUPPORT_ALIAS,
            cc: this.designspecialistemail,
            bcc: "",
            name: GMAIL_SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.failed.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Project has Failed`, "", {
            htmlBody: this.message.failedMessage,
            from: SUPPORT_ALIAS,
            cc: this.designspecialistemail,
            bcc: "",
            name: GMAIL_SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.cancelled.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Project has been Cancelled`, "", {
            htmlBody: this.message.cancelledMessage,
            from: SUPPORT_ALIAS,
            cc: this.designspecialistemail,
            bcc: "",
            name: GMAIL_SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.closed.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Project Closed`, "", {
          htmlBody: this.message.completedMessage,
          from: SUPPORT_ALIAS,
          cc: this.designspecialistemail,
          bcc: "",
          name: GMAIL_SERVICE_NAME,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.abandoned.plaintext:
        GmailApp.sendEmail(this.email, `${GMAIL_SERVICE_NAME} : Project hasn't been picked up yet!`, "", {
          htmlBody: this.message.abandonedMessage,
          from: SUPPORT_ALIAS,
          cc: this.designspecialistemail,
          bcc: "",
          name: GMAIL_SERVICE_NAME,
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














