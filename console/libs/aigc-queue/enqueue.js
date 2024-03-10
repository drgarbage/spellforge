import amqplib from 'amqplib';
import { customAlphabet } from 'nanoid';
import { save } from 'libs/api-firebase';

const { AMQP_HOST, AMQP_CALLBACK_HOST } = process.env;

// 將運算加入到排程
export default async function enqueue(options) { // options : { api, params }
  const taskId = customAlphabet('1234567890abcdef', 6)();
  const task = {
    ...options,
    id: taskId,
    reportProgress: `${AMQP_CALLBACK_HOST}/api/aigc/${taskId}/progress`,
    reportResult: `${AMQP_CALLBACK_HOST}/api/aigc/${taskId}/result`,
    progress: 0,
    progressImage: null,
    result: null,
    createAt: new Date(),
  };

  await save('tasks-aigc', taskId, {...task, params: { ...task.params, init_images: [], alwayson_scripts: {} }});

  const queue = 'generation';
  const conn = await amqplib.connect(AMQP_HOST);
  const channel = await conn.createConfirmChannel();
  await channel.assertQueue(queue, {durable: false});
  const message = Buffer.from(JSON.stringify(task));
  channel.sendToQueue(queue, message);

  await channel.waitForConfirms();
  await channel.close();
  await conn.close();

  return task;
}