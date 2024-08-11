import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "brainiac-ea4eb.firebaseapp.com",
    projectId: "brainiac-ea4eb",
    storageBucket: "brainiac-ea4eb.appspot.com",
    messagingSenderId: "516269312357",
    appId: "1:516269312357:web:262f2b0619e6a2a1e2b98c",
    measurementId: "G-D6HXFTCYSE"
  };    

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const saveDataToFirestore = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'promptHistory'), data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
const fetchDataFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'promptHistory'));
    const data = querySnapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data()
    }));
    console.log("Fetched data: ", data);
    return data;
  } catch (e) {
    console.error("Error fetching documents: ", e);
  }
};
const deleteDataFromFirestore = async (docId) => {
  try { 
    await deleteDoc(doc(db, 'promptHistory', docId));
    console.log(` deleted successfully`);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
};
export {saveDataToFirestore,fetchDataFromFirestore,deleteDataFromFirestore}  