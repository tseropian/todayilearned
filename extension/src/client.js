 
  const url = window.top.location.href
  const dateNow = Date.now(); // "2020-06-13T18:30:00.000Z"
  console.log(url, dateNow);
  console.log(navigator.userAgent)
  const posturl = 'https://httpbin.org/anything';
const options = {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=UTF-8'
  },
  body: JSON.stringify({
    url,
    dateNow
  })
};

fetch(posturl, options)
  .then(response => {
    console.log(response);
  });