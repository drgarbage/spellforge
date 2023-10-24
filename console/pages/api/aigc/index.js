import amqplib from 'amqplib';
import { customAlphabet } from 'nanoid';
import { save, document } from 'libs/api-firebase';
import { observe } from 'libs/api-firebase';

const { AMQP_HOST, AMQP_CALLBACK_HOST } = process.env;
// const AMQP_CALLBACK_HOST = 'http://192.168.50.94:3000';

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '100mb' // Set desired value here
      }
  }
}

export default async (req, res) => {
  let responsed = false;
  const taskId = customAlphabet('1234567890abcdef', 6)();
  const task = {
    mode: 'await', // pass | await
    ...req.body,
    id: taskId,
    reportProgress: `${AMQP_CALLBACK_HOST}/api/aigc/${taskId}/progress`,
    reportResult: `${AMQP_CALLBACK_HOST}/api/aigc/${taskId}/result`,
    progress: 0,
    progressImage: null,
    result: null,
    createAt: new Date(),
  };

  const shouldWait = task.mode === 'await';

  await save('tasks-aigc', taskId, {...task, params: { ...task.params, init_images: [], alwayson_scripts: {} }});

  // hint: only subscribe in await mode
  const unsubscribe = shouldWait ?
    observe('tasks-aigc', taskId, (doc) => {
      if(responsed) return;
      if(!doc.result) return;
      responsed = true;
      res.status(200).json(doc);
    }): () => {};

  const queue = 'generation';
  const conn = await amqplib.connect(AMQP_HOST);
  const channel = await conn.createConfirmChannel();
  await channel.assertQueue(queue, {durable: false});
  const message = Buffer.from(JSON.stringify(task));
  channel.sendToQueue(queue, message);

  await channel.waitForConfirms();

  channel.close();
  conn.close();

  if(shouldWait)
    // hint: only subscribe in await mode
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
  else
    res.status(200).json(task);
}