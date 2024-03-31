import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/functions';
import { collection, deleteDoc, doc, addDoc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, setDoc, where, onSnapshot, runTransaction } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, listAll, updateMetadata, uploadBytes } from 'firebase/storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import { FacebookAuthProvider, getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from "firebase/auth";

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
var recaptchaVerifier = null;

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
      queryArgs.push(where(attr, 'in', value));
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

  console.log(q);
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

export const updateWithCondition = async (path, id, data, condition) => {
  const firestore = getFirestore();
  return runTransaction(firestore, async (tran) => {
    const docRef = doc(firestore, path, id);
    const snapshot = await getDoc(docRef);
    const currentData = snapshot.data();
    const shouldContinue = await condition(currentData);
    if(shouldContinue)
      tran.update(docRef, data);
  });
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

export const uploadImage = async (path, data, meta = undefined) => {
  const defaultMeta = {
    cacheControl: 'public, max-age=7200, s-maxage=7200',
    ...meta
  };
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, data, defaultMeta);
  const imageUrl = await getDownloadURL(storageRef);
  return imageUrl;
}

export const estimateURL = async (path) => {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const imageUrl = await getDownloadURL(storageRef);
  return imageUrl;
}

export const observe = (path, id, callback) => 
  onSnapshot(doc(getFirestore(), path, id), (doc) => callback(doc.data()));

export const robotVerify = (containerName) => 
  new Promise((resolve, reject) => {
    try{
      const config = {
        'size': 'invisible',
        'callback': (response) => resolve(response),
        'expired-callback': () => reject('Expired')
      };
      const auth = getAuth();
      auth.useDeviceLanguage();
      recaptchaVerifier = new RecaptchaVerifier(containerName, config, auth);
    }catch(err){
      reject(err);
    }
  });

export const authByPhone = (phoneNumber) => 
  signInWithPhoneNumber(getAuth(), phoneNumber, recaptchaVerifier);


export const authByGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  auth.useDeviceLanguage();
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential.accessToken;
  const user = result.user;
  return { credential, token, providerId: 'google', user};
}

export const authByFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const auth = getAuth();
  auth.useDeviceLanguage();
  const result = await signInWithPopup(auth, provider);
  const credential = FacebookAuthProvider.credentialFromResult(result);
  const token = credential.accessToken;
  const user = result.user;
  return { credential, token, providerId: 'facebook', user};
}