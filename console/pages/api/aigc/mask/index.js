import { segmentForeground } from "@imgly/background-removal-node";

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
    const imageSrcBlob = new Blob([imageSrcBuffer], { type: contentType })
    const rembgBlob = await segmentForeground(imageSrcBlob);
    const rembgBuffer = Buffer.from(await rembgBlob.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.status(200).send(rembgBuffer);
  }catch(err){
    res.status(500).json({result: false, message: err.message});
  }
}