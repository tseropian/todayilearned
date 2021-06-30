/* eslint-disable no-restricted-syntax */
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const db = new sqlite3.Database('/home/thomas/Desktop/places.sqlite');

db.serialize(() => {
  db.all('SELECT moz_historyvisits.visit_date, moz_places.url,	moz_places.title, moz_places.description FROM moz_historyvisits JOIN moz_places ON moz_historyvisits.place_id = moz_places.id ', (err, tables) => {
    let cpt = 0;
    for (const t of tables) {
      if (t.url.includes('wikipedia.org')) {
        cpt += 1;

        const options = {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
          },
          body: {
            url: t.url,
            date: t.visit_date,
            source: 'Firefox History T480s',
          },
        };
        // if (cpt < 3) {
          // console.log(options);
        const urlPost = 'https://bx57iqgdb5.execute-api.us-east-1.amazonaws.com/dev/links';
        // const urlPost = 'http://localhost:3000/dev/links';
        axios.post(
          urlPost,
          options,
        )
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
        // }
      }
    }
    // console.log(cpt);
  });
});

db.close();
