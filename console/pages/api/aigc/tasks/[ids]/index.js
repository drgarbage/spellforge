import { documents } from "libs/api-firebase";

export default async (req, res) => {
  const { ids } = req.query;
  const results = await documents('/tasks-aigc', {id: ids.split(',')});
  const tasks = results.map(t => ({
    ...t,
    createAt: t.createAt?.toDate?.().toISOString?.(),
    completeAt: t.completeAt?.toDate?.().toISOString?.()
  }));
  res.status(200).json(tasks);
}