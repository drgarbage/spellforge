const profile = {
  type: "PatternGenerator",
  name: 'Gym Girl',
  photos: ['/images/gymgirl.png'],
  linked: {
    instagram: {
      username: 'gymgirl.artificial',
      password: 'artificial',
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
      'workout on train, exercise <lora:SceneTrainJR:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> e235 train interior',
      'workout on train, exercise <lora:SceneTrainHankyu:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> hankyu3000',
      'trainning in classroom, workout, <lora:SceneSchool:0.8:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> kyoushitsu rouka kaidan',
      'workout, exercise, <lora:SceneRehearsalStudio:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> rihasuta',
      'workout, exercise, <lora:SceneRecordingStudio:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> mdrcd0900st controlroom recbooth',
      'workout, exercise, <lora:SceneRecordingBooth:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> recbooth',
      'workout, exercise, <lora:ScenePoolOfPorn:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> shs reinopool',
      'workout, exercise, <lora:SceneMirrorMobile:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> shs mmgou, mmgou, window, curtains, couch, iindoors, cityscape, city,  (wide view:1.4), ultra-detailed, sitting',
      'workout, exercise, <lora:SceneKaraoke:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> karaokeroom',
      'workout, exercise, <lora:SceneTaiwanStreet:1:0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1> metal steel building',
    ]
  },
  comment: 'Photo of today. #photograph'
};

module.exports = profile;