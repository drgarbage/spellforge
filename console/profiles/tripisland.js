const profile = {
  type: "PatternGenerator",
  name: 'Trip Island',
  photos: ['https://firebasestorage.googleapis.com/v0/b/yoonji-console.appspot.com/o/images%2Ftripisland.png?alt=media&token=76260779-b385-4104-9853-2a0853475845'],
  linked: {
    instagram: {
      username: 'trip.aisland',
      password: 'A860046Z'
    }
  },
  prompt: '[nsfw], [character], 1girl, cute, smiling, [places], [dressing], [quality], [embedding]',
  promptOptions: {
    character: [
      'Photo of a Japanese idol, <lora:char doll japan:1:1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0> <lora:char Teen Girls:0.8:MIDD>',
      'Photo of a k-pop girl, <lora:char doll korean:1:1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0> <lora:char Teen Girls:0.8:MIDD>',
      'Photo of a Taiwanese idol, <lora:char doll taiwan:1:1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0> <lora:char Teen Girls:0.8:MIDD>',
    ],
    nsfw: ['(nsfw:0.2)', '(nsfw:0.8)', '(nsfw:0.8)', '(nsfw:0.8)', '(nsfw:1)', '(nsfw:1.2)'],
    dressing: ['','sleeveless, wet clothes, rain, see-through'],
    quality: ['','masterpiece, raw photo, photorealistic, Kodak Portra 400, film grain, blurry background'],
    embedding: ['','char-k-pop','char-pure-eros'],
    shape: ['','skinny','strong','fitness'],
    places: [
      '<lora:SceneTrainJR:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> e235 train interior',
      '<lora:SceneTrainHankyu:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> hankyu3000',
      '<lora:SceneSchool:0.8:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> kyoushitsu rouka kaidan',
      '<lora:SceneRehearsalStudio:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> rihasuta',
      '<lora:SceneRecordingStudio:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> mdrcd0900st controlroom recbooth',
      '<lora:SceneRecordingBooth:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> recbooth',
      '<lora:ScenePoolOfPorn:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> shs reinopool',
      '<lora:SceneMirrorMobile:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> shs mmgou, mmgou, window, curtains, couch, iindoors, cityscape, city,  (wide view:1.4), ultra-detailed, sitting',
      '<lora:SceneKaraoke:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> karaokeroom',
      '<lora:SceneTaiwanStreet:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> metal steel building',
    ]
  },
  comment: 'Photograph. #photograph'
};

module.exports = profile;