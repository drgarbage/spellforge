import { update } from "libs/api-firebase";
import { document } from "libs/api-firebase";

export default async (req, res) => {
  const {id : taskId} = req.query;

  if(!!req.body && !!req.body.progress) {
    const { progress, progressImage } = req.body;
    await update('tasks-aigc', taskId, { progress, progressImage});
  }

  const { progress,  progressImage } = 
    await document('tasks-aigc', taskId);
    
  res.status(200).json({ progress,  progressImage });
}