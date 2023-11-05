import { create } from 'kubo-rpc-client';
const axios = require('axios');
const sharp = require('sharp');

const { IPFS_HOST } = process.env;

export const imageURL2Buffer = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

export default async (req, res) => {
  const {cid} = req.query;
  const ipfs = create(IPFS_HOST);

  const bytes = [];
  for await (const chunk of ipfs.cat(cid)) {
    bytes.push(...chunk);
  }

  const imageBuffer = Buffer.from(bytes);
  try {

    const overlayBuffer = await sharp(await imageURL2Buffer('https://ai.printii.com/images/logo_overlay.png'))
      .resize(128)
      .extend({
        right: 20,
        bottom: 20,
        extendWith: 'copy'
      })
      .toBuffer();

    const resultBuffer = await sharp(imageBuffer)
      .composite([{ input: overlayBuffer, gravity: 'southeast' }])
      .toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=259200');
    res.status(200).send(Buffer.from(resultBuffer));
  } catch (err) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=259200');
    res.status(200).send(Buffer.from(imageBuffer));
  }
    
}