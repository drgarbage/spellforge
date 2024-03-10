import imageOf from 'libs/ipfs/imageOf';
const axios = require('axios');
const sharp = require('sharp');

export const imageURL2Buffer = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

export default async (req, res) => {
  const {cid} = req.query;
  const resultBuffer = await imageOf(cid);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=259200');
  res.status(200).send(Buffer.from(resultBuffer));
}