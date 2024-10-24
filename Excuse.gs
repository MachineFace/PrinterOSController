

/**
 * ---------------------------------------------------------------------------------------------------------
 * Excuse and Advice Class
 */
class ExcuseAndAdviceService {
  constructor() {

  }

  /**
   * Generate an Excuse
   */
  static async Excuse() {
    const url = `https://excuser-three.vercel.app/v1/excuse`;
    const params = {
      method : "GET",
      headers : { "Authorization": "Basic ", },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };

    try {
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`);  
      const content = await JSON.parse(response.getContentText())[0].excuse;
      console.info(content);
      return content;
    } catch(err) {
      console.error(`"Excuse()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Generate Advice
   */
  static async Advice() {
    const url = `https://api.adviceslip.com/advice`;
    const params = {
      method : "GET",
      headers : { "Authorization": "Basic ", },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };

    try {
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`);  
      const content = await JSON.parse(response.getContentText()).slip.advice;
      console.info(content);
      return content;
    } catch(err) {
      console.error(`"Advice()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Generate Design Advice
   */
  static async DesignAdvice() {
    const url = `https://quotesondesign.com/wp-json/wp/v2/posts/?orderby=rand`;
    const params = {
      method : "GET",
      headers : { "Authorization": "Basic ", },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };

    try {
      const response = await UrlFetchApp.fetch(url, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`);  
      const content = await JSON.parse(response.getContentText())[0];
      const title = content.title.rendered;
      const quote = content.content.rendered;
      console.info(`Quote: ${quote} - ${title}`);
      return content;
    } catch(err) {
      console.error(`"DesignAdvice()" failed : ${err}`);
      return 1;
    }
  }

  /**
   * Shorten URL
   * @param {string} url
   * @return {string} shortened url
   */
  static async ShortenURL(url = ``) {
    const site = `https://api.shrtco.de/v2/shorten?url=${url}`;
    const params = {
      method : "POST",
      headers : { "Authorization": "Basic ", },
      contentType : "application/json",
      followRedirects : true,
      muteHttpExceptions : true,
    };

    try {
      const response = await UrlFetchApp.fetch(site, params);
      const responseCode = response.getResponseCode();
      if(responseCode != 200 && responseCode != 201) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`);  
      const content = await JSON.parse(response.getContentText()).result?.full_short_link;
      console.info(content);
      return content;
    } catch(err) {
      console.error(`"ShortenURL()" failed : ${err}`);
      return 1;
    }
  }

}

const Excuse = () => ExcuseAndAdviceService.Excuse();
const Advice = () => ExcuseAndAdviceService.Advice();
const DesignAdvice = () => ExcuseAndAdviceService.DesignAdvice();



