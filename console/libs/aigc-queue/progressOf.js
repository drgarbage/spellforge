import { document } from "libs/api-firebase";

export default async function progressOf(taskId) {
  const { progress = 0,  progressImage = null } = 
    await document('tasks-aigc', taskId) || {};

  return {id: taskId, progress, progressImage};
}