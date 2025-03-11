// firebaseController.ts
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { db, storage } from "./config";
import { UserInfo } from "./types";
import { v4 as uuidv4 } from 'uuid';

// Create a new document
export const createDocument = async (collectionName: string, data: UserInfo) => {
  const documentId = uuidv4();
  const timestamp = new Date();

  try {
    await setDoc(doc(db, collectionName, documentId), {
      ...data,
      createdAt: timestamp.toISOString(),
      documentId: documentId
    });
    console.log("Document successfully written with timestamp!");
  } catch (e) {
    console.error("Error writing document: ", e);
  }
};
  
  // Read a document
  export const readDocument = async (collectionName: string, documentId: string) => {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  };
  
  // Update an existing document
  export const updateDocument = async (collectionName: string, documentId: string, data: Partial<UserInfo>) => {
    const docRef = doc(db, collectionName, documentId);
    try {
      await updateDoc(docRef, data);
      console.log("Document successfully updated!");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };
  
  // Delete a document
  export const deleteDocument = async (collectionName: string, documentId: string) => {
    const docRef = doc(db, collectionName, documentId);
    try {
      await deleteDoc(docRef);
      console.log("Document successfully deleted!");
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };
  
  // Listen to document changes
  export const listenToDocumentChanges = (collectionName: string, documentId: string, callback: (data: UserInfo) => void) => {
    const docRef = doc(db, collectionName, documentId);
    return onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback(docSnapshot.data() as UserInfo);
      }
    });
  };

  // ********************* IMAGES ********************* 
////////////////////////////////////////// IMAGE UPLOAD FUNCTION //////////////////////////////////////////
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `images/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Image successfully uploaded, URL: ", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw new Error("Could not upload image");
  }
};