const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
require('firebase/compat/storage');
require('firebase/compat/functions');
const { collection, deleteDoc, doc, getDoc, addDoc, setDoc, getDocs, getFirestore, query, updateDoc, where, orderBy } = require('firebase/firestore');
const { getStorage, ref, uploadString, getDownloadURL, listAll, updateMetadata, deleteObject, getMetadata } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyAh5Ja5su59MF-gbFMbpgclCnqOJAFuM3o",
  authDomain: "yoonji-console.firebaseapp.com",
  projectId: "yoonji-console",
  storageBucket: "yoonji-console.appspot.com",
  messagingSenderId: "464400336008",
  appId: "1:464400336008:web:d7c543bc7f71fce6facb3d"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const document = async (path, id) => {
  const db = getFirestore();
  const snapshot = await getDoc(doc(db, path, id));
  return snapshot.exists() ?
    ({id, ...snapshot.data()}) : null;
}

const documents = async (path, matches) => {
  const db = getFirestore();
  const ref = collection(db, path);
  const queryArgs = [];

  for (let attr in matches) {
    let value = matches[attr];

    if (Array.isArray(value)) {
      queryArgs.push(where(attr, value[0], value[1]));
      queryArgs.push(orderBy(attr, 'asc'));
    } else if (typeof value === 'function') {
      queryArgs.push(where(attr, ...value()));
    } else if (typeof value === 'object' && value !== null) {
      queryArgs.push(value);
    } else if (value !== undefined && value !== null) {
      queryArgs.push(where(attr, '==', value));
      queryArgs.push(orderBy(attr, 'asc'));
    }
  }

  queryArgs.push(orderBy('createAt', 'desc'));

  const q = query(ref, ...queryArgs);
  const snapshot = await getDocs(q);
  const output = [];

  snapshot.forEach((doc) => output.push({ id: doc.id, ...doc.data() }));
  return output;
};


const update = (path, id, data) =>
  updateDoc(doc(getFirestore(), path, id), data);

const save = (path, id, data) =>
  setDoc(doc(getFirestore(), path, id), data);

const append = (path, data) =>
  addDoc(collection(getFirestore(), path), data);

const remove = (path, id) =>
  deleteDoc(doc(getFirestore(), path, id));

const upload = async (path, base64Data, meta = undefined) => {
  const defaultMeta = {
    cacheControl: 'public, max-age=7200, s-maxage=7200',
    ...meta
  };
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const snapshot = await uploadString(storageRef, base64Data, 'base64', defaultMeta);
  const imageUrl = await getDownloadURL(storageRef);
  return imageUrl;
};

const deleteFile = async (path) => {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
  return path;
}

const fileExists = async (path) => {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const meta = await getMetadata(storageRef).catch(err => false);
  return !!meta;
}

const batchUpdateMeta = async (path, meta) => {
  // Get a reference to the storage
  const storage = getStorage();
  const storageRef = ref(storage, path);

  // List all the items under the given path
  // const items = await listAll(storageRef);
  const { items: files } = await listAll(storageRef);
  const items = files.filter(f => f.contentType === 'image/png' );

  // Loop through each item and update the meta
  for (const item of items) {
    await updateMetadata(item, meta);
  }
};


module.exports = { document, documents, update, save, append, remove, upload, deleteFile, fileExists, batchUpdateMeta };