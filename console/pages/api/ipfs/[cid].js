import imageOf from 'libs/ipfs/imageOf';

export const config = {
  api: {
    responseLimit: false,
  },
}

export default async (req, res) => {
  const {cid} = req.query;
  const resultBuffer = await imageOf(cid);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=259200');
  res.status(200).send(Buffer.from(resultBuffer));
}