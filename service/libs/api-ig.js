const { IgApiClient } = require('instagram-private-api');

async function postToInstagram(username, password, image, caption) {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.account.login(username, password);
  const publishResult = await ig.publish.photo({
    file: image,
    caption: caption,
  });

  return publishResult;
}

async function postAlbumToInstagram(username, password, images, caption) {
  const ig = new IgApiClient();
  ig.state.generateDevice(username);
  await ig.account.login(username, password);
  const items = images.map(file => ({file}));
  const publishResult = await ig.publish.album({
    caption,
    items
  });

  return publishResult;
}

module.exports = { postToInstagram, postAlbumToInstagram };