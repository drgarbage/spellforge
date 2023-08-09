const request = async (
    url, { method = 'GET', headers = {}, body = undefined }
  ) => {
  const dest = `${location.protocol}//${url.replace('http://', '').replace('https://', '')}`;
  const response = await fetch(dest, {
    method,
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    body: !!body ? JSON.stringify(body) : undefined
  });

  if(!response.ok)
    throw new Error('Network Error');

  const result = await response.json();

  return result;
}

module.exports = { request };