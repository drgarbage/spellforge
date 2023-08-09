const jkgirl = {
  avatar: '/images/jkgirl.png',
  weather: 'sunny',
  datetime: 'day time',
  place: 'Japan',
  username: 'jkgirl.artificial',
  password: 'artificial',
  character: 'jk girl',
  name: 'JK Girl',
  template: {
    prefix: 'nsfw, close up portrait of Japanese high school girls',
    posing: '(laught out loud:1.3), (open mouth:1.2), funny, cute,happy, teeth, delight eyes',
    dressing: 'wet skin, rain, wet cloth, see-through',
    quality: 'Perfect lighting. colorful, Photography, RAW photo, best quality, ultra high res, photoshoot, (photorealistic:1.4), 8k, HDR, (absurdres:1.2), Kodak Portra 400, film grain, blurry background, (bokeh:1.2)',
    lora: '',
    embedding: 'ulzzang pureerosface_v1',
  },
  random: {
    places: [
      '<lora:SceneTrainJR:0.2:ALL> e235 train interior',
      '<lora:SceneTrainHankyu:0.2:ALL> hankyu3000',
      '<lora:SceneSchool:0.2:ALL> kyoushitsu rouka kaidan',
      '<lora:SceneRehearsalStudio:0.2:ALL> rihasuta',
      '<lora:SceneRecordingStudio:0.2:ALL> mdrcd0900st controlroom recbooth',
      '<lora:SceneRecordingBooth:0.:ALL> recbooth',
      '<lora:ScenePoolOfPorn:0.2:ALL> shs reinopool',
      '<lora:SceneMirrorMobile:0.2:ALL> mmgou',
      '<lora:SceneKaraoke:0.2:ALL> karaokeroom',
      '<lora:SceneTaiwanStreet:0.2:ALL> metal steel building',
    ],
    poses: [
      'have fun talking with classmate, sitting on the wooden chair by the window, reading book',
      'have fun talking with classmate, standing by the hallway, leaning against the corridor',
      'have fun talking with classmate, sitting on desk',
      'have fun talking with classmate, cute dancing, making funny face',
      'have fun talking with classmate, playing',
      'have fun talking with classmate, jumping with victory gesture',
    ],
    dresses: [
      'wear school uniform, multi layer dressing, white loose shirt, scarf, looming black bra under the shirt, college style mini thick winter tartan skirts, grey pleated, a-line ruched, high waisted',
      'nude, naked, school uniform',
      'half naked, school uniform',
      'bikini',
      'fashion outfit',
      'underwear, bra, panties',
      'wearing sweater, winter outfit',
    ],
  },
  templatePrompt: `It's [datetime], at [place], the weather is [weather], [prefix], [random:poses], [random:dresses], the photo was took from her friend's phone. FOV, [quality],[posing],[dressing],[embedding],[lora],[random:places]`,
  comment: 'Photograpy of Gym Girl #gym'
};

module.exports = {
  jkgirl
};