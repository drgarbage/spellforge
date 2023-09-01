
import { Client } from '@line/bot-sdk';

const { 
  CHANNEL_ACCESS_TOKEN : channelAccessToken, 
  CHANNEL_SECRET : channelSecret
} = process.env;

const client =  new Client({channelAccessToken, channelSecret});

const onError = error => {
  console.error(
    error.message,
    error?.originalError?.response?.data
  );
}

export default client;

export const from = (event) =>
  event.source.groupId || event.source.userId;

export const replyText = (event, text) =>
  client.replyMessage(event.replyToken, {type:'text', text}).catch(onError);

export const pushText = (event, text) => 
  client.pushMessage(from(event), {type:'text', text}).catch(onError);

export const replyImages = (event, imageUrls) =>
  client.replyMessage(event.replyToken,  
    {
      type: 'template',
      altText: `照片`,
      template: {
        type: 'image_carousel',
        columns: (Array.isArray(imageUrls) ? imageUrls : [imageUrls]).map(imageUrl => ({ 
          imageUrl,
          action: {
            type: "uri",
            label: "檢視照片",
            uri: imageUrl
          }
        }))
      }
    }
  ).catch(onError);

export const pushImages = (event, imageUrls) =>
  client.pushMessage(from(event), 
    {
      type: 'template',
      altText: `照片`,
      template: {
        type: 'image_carousel',
        columns: (Array.isArray(imageUrls) ? imageUrls : [imageUrls]).map(imageUrl => ({ 
          imageUrl, 
          action: {
            type: "uri",
            label: "檢視照片",
            uri: imageUrl
          }
        }))
      }
    }
  ).catch(onError);