import { create } from 'kubo-rpc-client';
const axios = require('axios');
const sharp = require('sharp');

const { IPFS_HOST } = process.env;
const OVERLAY_IMAGE_URL = 'https://ai.printii.com/images/logo_overlay.png';

export const imageURL2Buffer = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

export default async function imageOf(cid) {
  const ipfs = create(IPFS_HOST);

  const bytes = [];
  for await (const chunk of ipfs.cat(cid)) {
    bytes.push(...chunk);
  }

  const imageBuffer = Buffer.from(bytes);
  try{
    const overlayBuffer = 
      await sharp(await imageURL2Buffer(OVERLAY_IMAGE_URL))
        .resize(128)
        .extend({
          right: 20,
          bottom: 20,
          extendWith: 'copy'
        })
        .toBuffer();
    const resultBuffer = 
      await sharp(imageBuffer)
        .composite([{ input: overlayBuffer, gravity: 'southeast' }])
        .toBuffer();

    return resultBuffer;
  }catch(err){
    return imageBuffer;
  }

}