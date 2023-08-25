
import { Client } from '@line/bot-sdk';

const { 
  CHANNEL_ACCESS_TOKEN : channelAccessToken, 
  CHANNEL_SECRET : channelSecret
} = process.env;

const client =  new Client({channelAccessToken, channelSecret});

export default client;

export const from = (event) =>
  event.source.groupId || event.source.userId;

export const replyText = (event, text) =>
  client.replyMessage(from(event), {type:'text', text}).catch(console.error);

export const pushText = (event, text) => 
  client.pushMessage(from(event), {type:'text', text}).catch(console.error);

export const pushImages = (event, imageUrls) =>
  client.pushMessage(from(event), 
    (Array.isArray(imageUrls) ? imageUrls : [imageUrls]).map(
      imageUrl => ({
        type:'image', 
        originalContentUrl: imageUrl, 
        previewImageUrl: imageUrl
      }))).catch(console.error);