import amqplib from 'amqplib';

const { AMQP_HOST } = process.env;

export default async (req, res) => {
  const queue = 'generation';
  let conn;
  let channel;
  try{
    conn = await amqplib.connect(AMQP_HOST);
    channel = await conn.createConfirmChannel();
    await channel.purgeQueue(queue);
    await channel.waitForConfirms();
    res.status(200).json({result: true, message: 'Queue Clear'});
  }catch(err){
    console.error(err);
    res.status(500).json({result: false, message: err.message});
  }finally{
    if (channel) await channel.close();
    if (conn) await conn.close();
  }
}