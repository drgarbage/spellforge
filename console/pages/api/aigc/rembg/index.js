import { request } from "libs/api-base";

export default async (req, res) => {
  const rs = await request('https://ai.printii.com/sdapi/v1/rembg/remove_background', {})
  res.status(200).json(rs);
}
