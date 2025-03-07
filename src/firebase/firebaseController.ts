// firebaseController.ts
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion } from "firebase/firestore";
import { db } from "./config";
import { UserInfo } from "./types";

// Create a new document
export const createDocument = async (collectionName: string, documentId: string, data: UserInfo) => {
    try {
      await setDoc(doc(db, collectionName, documentId), data);
      console.log("Document successfully written!");
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