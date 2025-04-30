// firebaseController.ts
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion, addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
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
export const uploadImage = async (file: File): Promise<{ downloadURL: string; uniqueFileName: string } | null> => {
  try {
    // Generate a unique filename using UUID
    const uniqueFileName = `${uuidv4()}`;
    const storageRef = ref(storage, `images/${uniqueFileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Image successfully uploaded, URL: ", downloadURL);
    
    return { downloadURL, uniqueFileName };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Could not upload image");
  }
};

  // ********************* VIDEOS ********************* 
export const uploadVideo = async (file: File): Promise<{ downloadURL: string; uniqueFileName: string } | null> => {
  try {
    // Generate a unique filename using UUID
    const uniqueFileName = `${uuidv4()}`;
    const storageRef = ref(storage, `videos/${uniqueFileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Video successfully uploaded, URL: ", downloadURL);

    return { downloadURL, uniqueFileName };
  } catch (error) {
    console.error("Error uploading video:", error);
    throw new Error("Could not upload video");
  }
};





// ********************* GUEST COMMENTS ********************* 
// Function to add a guest comment
export const addGuestComment = async (name: string, comment: string) => {
  try {
    await addDoc(collection(db, 'guestComments'), {
      name,
      comment,
      createdAt: serverTimestamp(), // Adding a timestamp here
    });
  } catch (error) {
    console.error('Error adding guest comment:', error);
    throw new Error('Could not add guest comment');
  }
};

// Function to fetch all guest comments
export const fetchGuestComments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'guestComments'));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null, // Convert timestamp to Date
      };
    });
  } catch (error) {
    console.error("Error fetching guest comments:", error);
    throw new Error("Could not fetch guest comments");
  }
};
// Function to delete a guest comment
export const deleteGuestComment = async (commentId: string) => {
  try {
    await deleteDoc(doc(db, 'guestComments', commentId));
    console.log("Guest comment deleted successfully!");
  } catch (error) {
    console.error("Error deleting guest comment:", error);
    throw new Error("Could not delete guest comment");
  }
};
