import amqplib from 'amqplib';
import { customAlphabet } from 'nanoid';
import { save } from 'libs/api-firebase';

const { AMQP_HOST, AMQP_CALLBACK_HOST } = process.env;
// const AMQP_CALLBACK_HOST = 'http://192.168.50.94:3000';

export default async (req, res) => {
  const taskId = customAlphabet('1234567890abcdef', 6)();
  const task = {
    ...req.body,
    id: taskId,
    reportProgress: `${AMQP_CALLBACK_HOST}/api/aigc/${taskId}/progress`,
    reportResult: `${AMQP_CALLBACK_HOST}/api/aigc/${taskId}/result`,
    progress: 0,
    progressImage: null,
    result: null,
    createAt: new Date(),
  };

  await save('tasks-aigc', taskId, task);

  const queue = 'generation';
  const conn = await amqplib.connect(AMQP_HOST);
  const channel = await conn.createConfirmChannel();
  await channel.assertQueue(queue, {durable: false});
  const message = Buffer.from(JSON.stringify(task));
  channel.sendToQueue(queue, message);

  await channel.waitForConfirms();

  channel.close();
  conn.close();

  res.status(200).json(task);
}