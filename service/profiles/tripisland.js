const profile = {
  weather: 'sunny',
  datetime: 'day time',
  place: 'Some major city of asia',
  username: 'trip.aisland',
  password: 'A860046Z',
  character: '',
  name: '',
  template: {
    prefix: 'nsfw, photo of a k-pop girl model',
    posing: '1girl, cute, smiling, mouth open, happy, cheer, singlet, long brown hair, looking at viewer',
    dressing: 'sleeveless, wet clothes, rain, see-through',
    quality: 'perfect lighting. colorful, Photography, masterpiece, RAW photo, best quality, ultra high res, photoshoot, (photorealistic:1.4), 8k, HDR, (absurdres:1.2), Kodak Portra 400, film grain, blurry background, (bokeh:1.2)',
    lora: '<lora:[character]:0.4:MIDD>',
    embedding: 'isometric_dreams, pureerosface_v1, ulzzang',
  },
  completionPrompt: `
    It's [datetime], at [place], the weather is [weather], 
    Read following rules and response accordingly:
    1. Assuming you are the k-pop girl, named YoonJi, who share her moments daily on social network.
    2. Write a prompt for AI Generation art to generate a photo.
    3. Write a comment for posting the generated photo to Instagram.
    4. Splite prompt and comment with text: @comment@
    5. In prompt part:
      a) Must begin with: [prefix]
      b) Describe the subject of this photo, 
      c) Describe the outfit as detail as possible, including upper body, lower body wears.
      d) The dressing style could be Sexy, Casual, fashion, shiny or cool style according to time and place.
      e) Describe the enviroment, as detail as possible. Including country, city, place, Such as Restaurant, Night Club, Night Market,
         and describe each items, objects in this scene.
      f) Indicate its day time or night time.
      g) Attach one of the following line to the end of prompt:
          <lora:SceneTrainJR:0.2:ALL> e235 train interior
          <lora:SceneTrainHankyu:0.2:ALL> hankyu3000
          <lora:SceneSchool:0.2:ALL> kyoushitsu rouka kaidan
          <lora:SceneRehearsalStudio:0.2:ALL> rihasuta
          <lora:SceneRecordingStudio:0.2:ALL> mdrcd0900st controlroom recbooth
          <lora:SceneRecordingBooth:0.:ALL> recbooth
          <lora:ScenePoolOfPorn:0.2:ALL> shs reinopool
          <lora:SceneMirrorMobile:0.2:ALL> mmgou
          <lora:SceneKaraoke:0.2:ALL> karaokeroom
          <lora:SceneTaiwanStreet:0.2:ALL> metal steel building
    6. In comment part:
      a) Write a short comment for your mood or feeling at the moment like a young girl.
      b) You may mention a madeup friend in this format @name.artificial, ex: @anny.artificial @yoko.artifical @nanaco.artificial
      c) Use as many cute emoji as you like.
      d) Use all related tags comes in your mind.
  `,
};

module.exports = profile;