 
  const url = window.top.location.href
  const dateNow = Date.now(); // "2020-06-13T18:30:00.000Z"
  console.log(url, dateNow);
  console.log(navigator.userAgent)
  // const posturl = 'https://etcczvhf3na75fh7buadst6bhm.appsync-api.us-east-1.amazonaws.com/graphql';
  const posturl = 'https://bx57iqgdb5.execute-api.us-east-1.amazonaws.com/dev/links';
  

  const options = {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
  },
  body: JSON.stringify({url, source: 'ploplo'})
};

fetch(posturl, options)
  .then(response => {
    console.log(response);
  }).catch(err => {console.log(err)});