// firebaseController.ts
import { doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, arrayUnion, addDoc, collection, getDocs, serverTimestamp, query, where } from "firebase/firestore";
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
// Function to update the video URL based on a document's name field in the Firebase collection
export const updateVideoURL = async (collectionName: string, documentName: string, videoURL: string) => {
  try {
    const q = query(
      collection(db, collectionName),
      where("name", "==", documentName)
    );
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No matching documents found");
      throw new Error(`No document with name: ${documentName}`);
    }

    // Assuming there's only one document with the given name
    const docRef = querySnapshot.docs[0].ref;

    await updateDoc(docRef, { video: videoURL });
    console.log("Video URL updated successfully in document named:", documentName);
  } catch (error) {
    console.error("Error updating video URL:", error);
    throw new Error("Could not update video URL");
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





// Store the start time in Firestore
export const storeStartTime = async (startTime: number, collectionName:string, documentId:string) => {
  try {
    await setDoc(doc(db, collectionName, documentId), { startTime });
    console.log("Start time stored successfully!");
  } catch (error) {
    console.error("Error storing start time:", error);
    throw new Error("Could not store start time");
  }
};

// Store the stop time in Firestore
export const storeStopTime = async (stopTime: number, collectionName:string, documentId:string) => {
  try {
    await setDoc(doc(db, collectionName, documentId), { stopTime }, { merge: true });
    console.log("Stop time stored successfully!");
  } catch (error) {
    console.error("Error storing stop time:", error);
    throw new Error("Could not store stop time");
  }
};

// Retrieve both start and stop times from Firestore
export const getTripTimes = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      return {
        startTime: data.startTime || null,
        stopTime: data.stopTime || null
      };
    } else {
      console.log("No trip data found!");
      return { startTime: null, stopTime: null };
    }
  } catch (error) {
    console.error("Error retrieving trip times:", error);
    throw new Error("Could not retrieve trip times");
  }
};



export const fetchQuestionsAndVideoByName = async (collectionName: string, name: string) => {
  try {
    const q = query(collection(db, collectionName), where("name", "==", name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents found!");
      return { questions: [], videoURL: null };
    }

    let questionsList: Array<string> = [];
    let videoURL: string | null = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Assuming questions are now a flat array
      if (Array.isArray(data.questions)) {
        questionsList = [...questionsList, ...data.questions];
      }
      
      if (typeof data.video === 'string') {
        videoURL = data.video;
      }
    });

    return { questions: questionsList, videoURL };
  } catch (error) {
    console.error("Error fetching questions and video by name:", error);
    throw new Error("Could not fetch questions and video");
  }
};

export const updateAnswers = async (collectionName: string, nameField: string, newAnswers: Array<string>) => {
  try {
    const q = query(collection(db, collectionName), where("name", "==", nameField));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No document found with name: ${nameField}`);
    }

    const docRef = querySnapshot.docs[0].ref;

    // Update should match the new structure
    await updateDoc(docRef, {
      questions: newAnswers // Ensure this corresponds to your new array structure
    });

    console.log("Document successfully updated!");
  } catch (error) {
    console.error("Error updating document: ", error);
    throw new Error("Could not update answers");
  }
};

export const addQuestionToDocument = async (collectionName: string, nameField: string, newQuestion: string) => {
  try {
    const q = query(collection(db, collectionName), where("name", "==", nameField));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(`No document found with name: ${nameField}`);
    }

    const docRef = querySnapshot.docs[0].ref;

    // Use arrayUnion to add a new question to the existing questions array
    await updateDoc(docRef, {
      questions: arrayUnion(newQuestion)
    });

    console.log("New question added successfully!");
  } catch (error) {
    console.error("Error adding new question: ", error);
    throw new Error("Could not add new question");
  }
};