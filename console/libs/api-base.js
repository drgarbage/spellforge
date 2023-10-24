const axios = require('axios');

const request = async (
    url, { method = 'GET', headers = {}, body = undefined }
  ) => {
  const isRelativePath = url.indexOf('://') === -1;
  const protocol = typeof(window) !== 'undefined' && window.location ? window.location.protocol : 'https:';
  const dest = isRelativePath ? url : `${protocol}//${url.replace('http://', '').replace('https://', '')}`;

  const response = await axios({
    timeout: 300000,
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
