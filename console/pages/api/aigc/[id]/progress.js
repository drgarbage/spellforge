import { updateWithCondition } from "libs/api-firebase";
import { document } from "libs/api-firebase";

const isNumber = (value) => 
  typeof value === 'number' && isFinite(value);

export default async (req, res) => {
  const {id : taskId} = req.query;

  if(!!req.body && !!req.body.progress && isNumber(req.body.progress)) {
    const { progress, progressImage } = req.body;
    const data = { progress, progressImage};
    await updateWithCondition(
      'tasks-aigc', taskId, data, 
      (existedData) => {
        if(!existedData) return false;
        if(!isNumber(existedData?.progress)) return true;
        return progress > existedData.progress;
      }
    );
  }

  const { progress = 0,  progressImage = null } = 
    (await document('tasks-aigc', taskId)) || {};
    
  res.status(200).json({ progress,  progressImage });
}