import { request } from "libs/api-base";

export default async (req, res) => {
  const rs = await request('https://ai.printii.com/sdapi/v1/sd-models', {})
  res.status(200).json(rs);
}
