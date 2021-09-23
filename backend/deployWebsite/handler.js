'use strict';
const axios = require('axios');

module.exports.deploy = async (event) => {
  console.log('Running a deploy')
  const url = 'https://api.vercel.com/v1/integrations/deploy/prj_MiCy3E8t652hTFeBtXIi6L7oMnaj/2oO7D24Omq';
  // const url = 'https://httpbin.org/anything';
  const result = await axios.get(url).then(res => res.data);
  console.log(result)
  return result;
  
};
