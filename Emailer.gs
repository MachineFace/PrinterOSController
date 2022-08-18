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
    this.gmailName = `Jacobs Self-Service Printing Bot`;
    this.supportAlias = GmailApp.getAliases()[0];
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
        GmailApp.sendEmail(this.email, `${this.gmailName} : Queued`, "", {
          htmlBody: this.message.queuedMessage,
          from: this.supportAlias,
          cc: this.designspecialistemail,
          bcc: "",
          name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.inProgress.plaintext:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Project Started`, "", {
            htmlBody: this.message.inProgressMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.complete.plaintext:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Project Completed`, "", {
            htmlBody: this.message.completedMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.failed.plaintext:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Project has Failed`, "", {
            htmlBody: this.message.failedMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.cancelled.plaintext:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Project has been Cancelled`, "", {
            htmlBody: this.message.cancelledMessage,
            from: this.supportAlias,
            cc: this.designspecialistemail,
            bcc: "",
            name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.closed.plaintext:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Project Closed`, "", {
          htmlBody: this.message.completedMessage,
          from: this.supportAlias,
          cc: this.designspecialistemail,
          bcc: "",
          name: this.gmailName,
        });
        console.warn(`Student ${this.name} emailed ${this.status} message...`);
        break;
      case STATUS.abandoned.plaintext:
        GmailApp.sendEmail(this.email, `${this.gmailName} : Project hasn't been picked up yet!`, "", {
          htmlBody: this.message.abandonedMessage,
          from: this.supportAlias,
          cc: this.designspecialistemail,
          bcc: "",
          name: this.gmailName,
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














