import { pushText } from './client';
import { handleText } from "./handleText";
import { handleImage } from "./handleImage";

export const handleEvent = (event) => {

  if (event.type === 'message' && event.message.type === 'text') {
    handleText(event).catch(err => {
      console.error(err.message);
      pushText(event, '抱歉，麻煩換個方式再試一下！');
    });
  }

  if (event.type === 'message' && event.message.type === 'image') {
    handleImage(event).catch(err => {
      console.error(err.message);
      pushText(event, '抱歉，圖片處理過程發生錯誤，請換張圖試試。');
    });
  }

}