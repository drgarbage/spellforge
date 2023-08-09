import { openDB } from 'idb';
import { addMetadata, addMetadataFromBase64DataURI, getMetadata } from 'meta-png';
import { customAlphabet } from 'nanoid';
import { parseParameters } from './utils';

let dbPromise;

if (typeof window !== 'undefined') {
  dbPromise = openDB('grimoires-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('grimoires')) {
        db.createObjectStore('grimoires', { keyPath: 'id' });
      }
    },
  });
}

export const grimoires = async () => {
  const db = await dbPromise;
  return db.getAll('grimoires');
};

export const grimoire = async (id) => {
  const db = await dbPromise;
  return db.get('grimoires', id);
}

export const createGrimoire = async (data) => {
  const id = customAlphabet('1234567890abcdef', 6)();
  const db = await dbPromise;
  const transaction = db.transaction('grimoires', 'readwrite');
  transaction.objectStore('grimoires').put({ ...data, id });
  await transaction.done;
  return { ...data, id };
};

export const updateGrimoire = async (id, changes, replace = false) => {
  const db = await dbPromise;
  const grimoire = await db.get('grimoires', id);
  if (!grimoire) throw new Error('Grimoire not found');
  const updatedGrimoire = replace ? changes : { ...grimoire, ...changes };
  const transaction = db.transaction('grimoires', 'readwrite');
  transaction.objectStore('grimoires').put(updatedGrimoire);
  await transaction.done;
  return updatedGrimoire;
};

export const deleteGrimoire = async (id) => {
  const db = await dbPromise;
  const transaction = db.transaction('grimoires', 'readwrite');
  transaction.objectStore('grimoires').delete(id);
  await transaction.done;
};

export const shareGrimoire = async ({
  host = undefined,  // host of stable-diffusion web api
  author = undefined, // user name
  avatar = undefined, // url for user profile photo
  grimoire, // config object { id, type, name, createAt, photos, prompt, promptOptions }
  image // base64image
}) => {
  /**
   * - ths image is a base64Image
   * - store host string to image's exif "host" property.
   * - store author string to image's exif "author" property.
   * - store avatar string to image's exif "avatar" property.
   * - store grimoire object as JSON string to image's exif "grimoire" property
   * - 
   */
}

export const defaultPreferences = {
  sdapi: 'ai.printii.com',
  openai: null,
  author: 'Mystery Magician',
  avatar: '/images/avatar.png',
};

export const userPreferences = async () => {
  return Object.keys(defaultPreferences).reduce((p,key) => {
    p[key] = localStorage.getItem(key) || defaultPreferences[key] || '';
    return p;
  }, {});
}

export const updateUserPreferences = async (changes) => {
  for(let key in changes) {
    localStorage.setItem(key, changes[key] || '');
  }
}

// drop image
// import image
export const pngInfo = (base64Image) => {
  const buffer = new Uint8Array(Buffer.from(base64Image, 'base64'));
  const parameters = getMetadata(buffer, 'parameters');
  const info = parseParameters(parameters);
  return info;
}
export const updatePngInfo = (base64Image, info) => {
  let buffer = new Uint8Array(Buffer.from(base64Image, 'base64'));
  for(let key in info)
    buffer = addMetadata(buffer, key, info[key]);
  return Buffer.from(buffer).toString('base64');
}