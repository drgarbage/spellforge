import { updateWithCondition } from "libs/api-firebase";
import { isNumber } from "lodash";

export default async function updateProgress(taskId, progress, progressImage) {
  if(!progress || !isNumber(progress)) return;

  const data = { progress, progressImage };
  await updateWithCondition(
    'tasks-aigc', taskId, data,
    (existedData) => {
      if(!existedData) return false;
      if(!isNumber(existedData?.progress)) return true;
      return progress > existedData.progress;
    }
  )
}