import { create } from 'kubo-rpc-client';
const { IPFS_HOST } = process.env;

export default async (req, res) => {
  const {cid} = req.query;
  const ipfs = create(IPFS_HOST);

  const bytes = [];
  for await (const chunk of ipfs.cat(cid)) {
    bytes.push(...chunk);
  }

  res.setHeader('Content-Type', 'image/png');
  res.status(200).send(Buffer.from(bytes));
}