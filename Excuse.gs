


const Excuse = () => {
  const url = `https://excuser-three.vercel.app/v1/excuse`;
  const params = {
    method : "GET",
    headers : { "Authorization": "Basic ", },
    contentType : "application/json",
    followRedirects : true,
    muteHttpExceptions : true,
  };

  try {
    const response = UrlFetchApp.fetch(url, params);
    const responseCode = response.getResponseCode();
    if(responseCode != 200) throw new Error(`Bad response from server: ${responseCode}: ${RESPONSECODES[responseCode]}`);  
    const content = JSON.parse(response.getContentText())[0].excuse;
    console.info(content);
    return content;
  } catch(err) {
    console.error(`"Excuse()" failed : ${err}`);
    return 1;
  }
}

