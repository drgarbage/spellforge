import { request } from "libs/api-base";

export default async (req, res) => {
  try{
    const rs = await request('https://ai.printii.com/sdapi/v1/rembg/remove_background', {})
    res.status(200).json(rs);
  }catch(err){
    res.status(500).json({result: false, message: err.message});
  }
}