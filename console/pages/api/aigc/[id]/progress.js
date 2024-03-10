import progressOf from "libs/aigc-queue/progressOf";
import updateProgress from "libs/aigc-queue/updateProgress";

const isNumber = (value) => 
  typeof value === 'number' && isFinite(value);

export default async (req, res) => {
  const {id : taskId} = req.query;

  if(!!req.body && !!req.body.progress && isNumber(req.body.progress)) {
    const { progress, progressImage } = req.body;
    await updateProgress(taskId, progress, progressImage);
  }

  const latestProgress =
    await progressOf(taskId);
    
  res.status(200).json(latestProgress);
}