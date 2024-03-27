import { create } from 'kubo-rpc-client';

export default async (req, res) => {
  if(req.method.toLowerCase() !== 'post') {
    res.status(200).json({message: 'Method not supported.'});
    return;
  }  
  const ipfs = create(IPFS_HOST);
  const data = {
    content: req.body
  }
  const rs = await ipfs.add(data);
  
}