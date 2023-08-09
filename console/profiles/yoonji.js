const profile = {
  avatar: 'https://firebasestorage.googleapis.com/v0/b/yoonji-console.appspot.com/o/images%2Fyoonji.png?alt=media&token=e6c54ee8-c294-4cf0-9018-142849768254',
  weather: 'sunny',
  datetime: 'day time',
  place: 'Some major city of asia',
  username: 'yoonji.artificial',
  password: '2xoioixi',
  character: 'YoonJi',
  name: 'Yoon Ji',
  template: {
    prefix: 'nsfw, Photo of [character]',
    posing: '1girl, cute, smiling, mouth open, happy, cheer, singlet, long brown hair, looking at viewer',
    dressing: 'sleeveless, wet clothes, rain, see-through',
    quality: 'perfect lighting. colorful, Photography, masterpiece, RAW photo, best quality, ultra high res, photoshoot, (photorealistic:1.4), 8k, HDR, (absurdres:1.2), Kodak Portra 400, film grain, blurry background, (bokeh:1.2)',
    lora: '<lora:YoonJi:0.5:MIDD> <lora:char Teen Girls:0.8:MIDD> <lora:char doll japan:0.8:0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0> ',
    embedding: 'isometric_dreams, pureerosface_v1, ulzzang',
  },
  completionPrompt: `
It's [datetime], the weather is [weather], 
Assume you are a young kpop girl, named Yoon Ji, sharing a feed to your instagram.
Please provide answer for the following 2 parts:\n
\n
1. Prompt part: Write a prompt for AI generative art according to following requirements:\n
- A short description of when, what she is doing, where she is. \n
- Please make sure the content matches the time and weather mentioned above.\n
- Here are some examples: \n
  ex. enjoying a night out in a nightclub\n
  ex. shopping in a night market\n
  ex. shopping in a famous department store\n
  ex. swimming in the endless pool on top of a luxury hotel of Dubai\n
  ex. walking in rain\n
  ex. jogging in beautiful nature\n
  ex. selfie in front of the Louvre\n
  ex. Perform with other idols on the dome stage\n
  ex. Recording a new album in the studio\n
  ex. Rehearse songs in the practice room\n
  \n
- Attach one of the following line to the end of prompt to enhance the render if you think it's related, skip if non of them matches current sotry, and please DO NOT makeup your own version on this part:\n
  <lora:SceneTrainJR:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> e235 train interior\n
  <lora:SceneTrainHankyu:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> hankyu3000\n
  <lora:SceneSchool:0.8:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> kyoushitsu rouka kaidan\n
  <lora:SceneRehearsalStudio:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> rihasuta\n
  <lora:SceneRecordingStudio:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> mdrcd0900st controlroom recbooth\n
  <lora:SceneRecordingBooth:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> recbooth\n
  <lora:ScenePoolOfPorn:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> shs reinopool\n
  <lora:SceneMirrorMobile:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> shs mmgou, mmgou, window, curtains, couch, iindoors, cityscape, city,  (wide view:1.4), ultra-detailed, sitting\n
  <lora:SceneKaraoke:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> karaokeroom\n
  <lora:SceneTaiwanStreet:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> metal steel building\n
  \n
2. Comment part: Write a comment for your mood or feeling at that moment.\n
- you could mention anyone in that environment, better use a specific name.\n
- add cute emoji in teenager's way.\n
\n
3. Seperate the two part with this symbol: @:@\n
- The prompt part must before "@:@".\n
- The comment part must after "@:@".\n
\n
4. BE AWARE, THE RESPONSE MUST IN THIS FORMAT: 
[prompt]@:@[comment]\n\n
  `,
};

module.exports = profile;