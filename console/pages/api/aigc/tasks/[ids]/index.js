import { documents } from "libs/api-firebase";

export default async (req, res) => {
  const { ids } = req.query;
  const tasks = await documents('/tasks-aigc', {id: ids.split(',')});
  res.status(200).json(tasks);
}