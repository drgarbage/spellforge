import { document } from 'libs/api-firebase';
import { observe } from 'libs/api-firebase';
import enqueue from 'libs/aigc-queue/enqueue';

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '100mb' // Set desired value here
      }
  }
}

export default async (req, res) => {
  let responsed = false;
  const params = req?.body;
  const shouldWait = params?.mode === 'await';
  const task = await enqueue(params);

  if(!shouldWait) {
    res.status(200).json(task);
    return;
  }

  // hint: only subscribe in await mode
  const unsubscribe = 
    observe('tasks-aigc', task.id, (doc) => {
      if(responsed) return;
      if(!doc.result) return;
      responsed = true;
      res.status(200).json(doc);
    });

  setTimeout(async () => {
    if(responsed) return;
    unsubscribe();
    let latestTask = task;
    try{
      latestTask = await document('tasks-aigc', taskId);
    }catch(err){
      console.error(err.message);
    }finally{
      res.status(200).json(latestTask);
    }
  }, 18000);
}