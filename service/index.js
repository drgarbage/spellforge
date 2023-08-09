const { completions } = require('./libs/api-openai');
const { txt2img } = require('./libs/api-sd');
const { postToInstagram, postAlbumToInstagram } = require('./libs/api-ig');
const { fetchWeather } = require('./libs/api-weather');
const { convertPngToJpg, template, pickTimes, argOf } = require('./libs/utils');
const { document, documents, upload, append, batchUpdateMeta, deleteFile, fileExists, update } = require('./libs/api-firebase');
const { PostGenerator } = require('./libs/post-generator');
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const { remove } = require('./libs/api-firebase');

const DEBUG = argOf('--debug');
const USE_BACKUP = argOf('--backup');
const UPSCALE = argOf('--upscale');
const BATCH_COUNT = argOf('--batch') || 1;

async function runAutoPost(seriesId, dryRun = false) {
  try{
    console.info(`Processing ${seriesId}`);
    const series = await document('series', seriesId);
    const datetime = moment().tz('Asia/Taipei').format('hh:mm a');
    const weather = await fetchWeather();
    const postGen = PostGenerator.fromConfig(series);
    const txt2imgOptions = series?.txt2imgOptions || {}
    const { prompt, comment } = await postGen.generate({datetime, weather});
    const { images } = await txt2img({prompt, ...txt2imgOptions, enable_hr: UPSCALE, n_iter: BATCH_COUNT }, USE_BACKUP);
    const imageUrls = await Promise.all(images.map((base64Image, index) => 
      upload(
        `/images/${series.linked.instagram.username}/${moment().unix()}-${index}.png`,
        base64Image,
        {contentType: 'image/png'}
      )
    ));
    const post = {
      name: series.name,
      tags: [],
      poster: series.id,
      time: moment().tz('Asia/Taipei').format('hh:mm a'),
      weather: weather,
      prompt, 
      comment, 
      image: imageUrls[0], 
      images: imageUrls.map((src, index) => ({src, skip: (index == 0 && imageUrls.length > 1) ? true : false})),
      createAt: moment().unix(),
      reviewState: 'IN_REVIEW', // 'APPROVED' | 'REJECTED'
      publishState: 'PENDING', // 'PUBLISHED'
    }
    await append('/posts', post);

    console.info('\n\cached:');
    console.info(`${series.name}'s photo has been added to firebase`);

    if(!dryRun) {
      const bufferImages = await Promise.all(images.map(img => convertPngToJpg(img)));

      console.info('login with:', 
        series?.linked?.instagram?.username
      );
      
      if(bufferImages.length > 1)
        await postAlbumToInstagram(
          series?.linked?.instagram?.username, 
          series?.linked?.instagram?.password, 
          bufferImages, comment
        );
      else
        await postToInstagram(
          series?.linked?.instagram?.username, 
          series?.linked?.instagram?.password, 
          bufferImages[0], comment
        );

      console.info('\n\nresult:');
      console.info(`${series.name}'s photo has been posted to Instagram`);
    }
    console.info(`---------------------`);

  }catch(err){
    console.error(err);
  }
}

async function genScheduleForADay() {
  const series = await documents('/series', {});
  series.forEach(profile => {
    const jobs = pickTimes();
    const jobString = jobs.map(j=>moment(j).tz('Asia/Taipei').toString()).join('\n');
    const tmeString = moment().tz('Asia/Taipei').toString();
    console.info(`Schedule of ${tmeString}\n${jobString}`);
    jobs.forEach(postTime => {
      schedule.scheduleJob(postTime, () => {
        runAutoPost(profile.id).catch((error) => console.error(error));
      });
    });
  });
}

const taipeiTime = moment().tz('Asia/Taipei').startOf('day').hour(4);
const utcTime = taipeiTime.clone().tz('UTC');

const rule = new schedule.RecurrenceRule();
rule.hour = utcTime.hour();
rule.minute = utcTime.minute();
rule.second = utcTime.second();
rule.tz = 'UTC';

if(!DEBUG){
  schedule.scheduleJob(rule, genScheduleForADay);
  genScheduleForADay();
}


if(DEBUG)
  (async function testAllSeries() {
    const seriesList = await documents('series'); // , { name: ['!=', 'Yoon Ji'] }
    console.info(`Test start with ${seriesList.length} profiles.`);
    while(true)
      for(let series of seriesList)
        await runAutoPost(series.id, false);
  })();

// if(DEBUG)
//   (async function removeOldPost() {
//     const posts = (await documents('posts'))
//       .filter(p => moment.unix(p.createAt).diff(moment(), 'days') < -20);

//     for(let post of posts) {
//       for(let i = 0; i < post?.images?.length; i++) {
//         try{
//           const pathname = new URL(post.images[i].src).pathname;
//           const filename = require('path').basename(pathname);
//           const path = decodeURIComponent(filename);
//           await deleteFile(path);
//           console.log('deleted:', path);
//         }catch(err){
//           console.error(err);
//         }
//       }
//       await remove('posts', post.id);
//       console.log('post deleted:', post.id);
//     }
//     return;
//   })();


// if(DEBUG) MAY HAVE BUG
//   (async function fixMissingImages() {
//     const posts = (await documents('posts'));

//     for(let post of posts) {
//       for(let i = 0; i < post?.images?.length; i++) {
//         try{
//           const pathname = new URL(post.images[i].src).pathname;
//           const filename = require('path').basename(pathname);
//           const path = decodeURIComponent(filename);
//           const exists = await fileExists(path);
//           post.images[i].exist = exists;
//         }catch(err){
//           console.error(err);
//         }
//       }
//       const restImages = post.images.filter(i => i.exist);

//       if(restImages.length === 0) {
//         await remove('posts', post.id);
//         console.log('post deleted:', post.id);
//       } else if(restImages.length < 5) {
//         await update('posts', post.id, {...post, images: restImages});
//         console.log('post updated:', restImages.length);
//       }
      
//     }
//     return;
//   })();