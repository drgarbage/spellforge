import { Textarea, Col } from '@nextui-org/react';

export default ({post}) => 
  <Col>
    <Textarea
      label='貼文內容'
      initialValue={post?.comment}
      width="100%"
      />
    <Textarea
      label='給繪圖的提示詞'
      initialValue={post?.prompt}
      width="100%"
      />
    <Textarea
      label='給 AI 的提示詞'
      initialValue={post?.background}
      width="100%"
      />
  </Col>