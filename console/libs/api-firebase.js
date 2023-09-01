import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/functions';
import { collection, deleteDoc, doc, addDoc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, setDoc, where } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, listAll, updateMetadata } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAh5Ja5su59MF-gbFMbpgclCnqOJAFuM3o",
  authDomain: "yoonji-console.firebaseapp.com",
  projectId: "yoonji-console",
  storageBucket: "yoonji-console.appspot.com",
  messagingSenderId: "464400336008",
  appId: "1:464400336008:web:d7c543bc7f71fce6facb3d",
  measurementId: "G-MXH169GJVZ"
};

const app = firebase.initializeApp(firebaseConfig);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const document = async (path, id) => {
  const db = getFirestore();
  const snapshot = await getDoc(doc(db, path, id));
  return snapshot.exists() ?
    ({id, ...snapshot.data()}) : null;
}

export const documents = async (path, matches) => {
  const db = getFirestore();
  const ref = collection(db, path);
  const queryArgs = [];

  for (let attr in matches) {
    let value = matches[attr];

    if (Array.isArray(value)) {
      queryArgs.push(where(attr, ...value));
    } else if (typeof value === 'function') {
      queryArgs.push(where(attr, ...value()));
    } else if (typeof value === 'object' && value !== null) {
      queryArgs.push(value);
    } else if (value !== undefined && value !== null) {
      queryArgs.push(where(attr, '==', value));
    }
  }

  queryArgs.push(orderBy('createAt', 'desc'));

  const q = query(ref, ...queryArgs);
  const snapshot = await getDocs(q);
  const output = [];

  snapshot.forEach((doc) => output.push({ id: doc.id, ...doc.data() }));
  return output;
};


export const documentMatches = async (path, matches) => {
  const db = getFirestore();
  const ref = collection(db, path);

  const queryArgs = [];

  for(let attr in matches) {
    if(matches[attr]) {
      queryArgs.push(where(attr, '==', matches[attr]));
      // queryArgs.push(orderBy(attr, 'asc'));
    }
  }

  queryArgs.push(orderBy('createAt','desc'));
  
  const q = query(ref, ...queryArgs);
  const snapshot = await getDocs(q);
  const output = [];
  snapshot.forEach(doc => output.push(({id:doc.id, ...doc.data()})));
  return output;
}

export const update = (path, id, data) =>
  updateDoc(doc(getFirestore(), path, id), data);

export const save = (path, id, data) =>
  setDoc(doc(getFirestore(), path, id), data);

export const append = (path, data) =>
  addDoc(collection(getFirestore(), path), data);

export const remove = (path, id) =>
  deleteDoc(doc(getFirestore(), path, id));

export const upload = async (path, base64Data, meta = undefined) => {
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

export const estimateURL = async (path) => {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const imageUrl = await getDownloadURL(storageRef);
  return imageUrl;
}