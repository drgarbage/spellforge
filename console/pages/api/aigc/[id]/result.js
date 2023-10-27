import { update } from "libs/api-firebase";
import { document } from "libs/api-firebase";

export default async (req, res) => {
  const {id : taskId} = req.query;

  if(!!req.body && !!req.body.result) {
    const { result, error } = req.body;
    const data = !!error ?
      { progress: 1, result, completeAt: new Date(), error }:
      { progress: 1, result, completeAt: new Date() }
    
    await update('tasks-aigc', taskId, data);
  }

  const task = 
    await document('tasks-aigc', taskId);
    
  res.status(200).json(task);
}