import { uploadImage } from "libs/api-firebase";
import uid from 'tiny-uid';

export const config = {
  api: {
    bodyParser: false,
  },
};


async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  try{
    const contentType = req.headers['content-type'];
    const imageSrcBuffer = await getRawBody(req);
    const imageid = uid(7, true);
    const url = await uploadImage(`/aigc-tmp/${imageid}`, imageSrcBuffer, {contentType});
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send({url});
  }catch(err){
    res.status(500).json({result: false, message: err.message});
  }
}