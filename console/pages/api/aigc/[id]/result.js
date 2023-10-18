import { update } from "libs/api-firebase";
import { document } from "libs/api-firebase";

export default async (req, res) => {
  const {id : taskId} = req.query;

  if(!!req.body && !!req.body.result) {
    const { result } = req.body;
    await update('tasks-aigc', taskId, { progress: 1, result, completeAt: new Date() });
  }

  const { progress,  progressImage, result } = 
    await document('tasks-aigc', taskId);
    
  res.status(200).json({ progress,  progressImage, result });
}