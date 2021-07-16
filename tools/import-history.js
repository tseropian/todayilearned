/* eslint-disable no-restricted-syntax */
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const db = new sqlite3.Database('/home/thomas/Desktop/places.sqlite');

(async () => {
  db.serialize(async () => {
    db.all('SELECT moz_historyvisits.visit_date, moz_places.url,	moz_places.title, moz_places.description FROM moz_historyvisits JOIN moz_places ON moz_historyvisits.place_id = moz_places.id ORDER BY visit_date ASC', (err, tables) => {
      for (const t of tables) {
        if (t.url.includes('wikipedia.org')) {
          const options = {
            url: t.url,
            date: Math.round(t.visit_date / 1000),
            source: 'Firefox History T480s',

          };
          const urlPost = 'https://v2uvowrw9j.execute-api.eu-west-1.amazonaws.com/dev/links';
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
        }
      }
    });
  });

  db.close();
})();
