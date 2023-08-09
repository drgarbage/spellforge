const axios = require('axios');

const request = async (
    url, { method = 'GET', headers = {}, body = undefined }
  ) => {
  const { data } = await axios({
    url,
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    data: body
  });

  return data;
}

module.exports = { request };