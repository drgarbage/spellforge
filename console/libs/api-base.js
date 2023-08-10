const axios = require('axios');

const request = async (
    url, { method = 'GET', headers = {}, body = undefined }
  ) => {
  const protocol = typeof(window) !== 'undefined' && window.location ? window.location.protocol : 'https:';
  const dest = `${protocol}//${url.replace('http://', '').replace('https://', '')}`;

  const response = await axios({
    method,
    url: dest,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    data: body
  });

  return response.data;
}

export { request };
