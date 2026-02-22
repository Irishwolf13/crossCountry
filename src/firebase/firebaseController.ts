import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { db, storage } from './config';
import type { Waypoint, GuestComment, TripTimes, MediaItem } from './types';

// ─── Media Upload ───────────────────────────────────────────────

export const uploadMedia = async (
  file: File,
  folder: 'images' | 'videos'
): Promise<{ downloadURL: string; uniqueFileName: string }> => {
  const uniqueFileName = crypto.randomUUID();
  const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return { downloadURL, uniqueFileName };
};

// ─── Waypoints ──────────────────────────────────────────────────

export const subscribeToWaypoints = (
  collectionName: string,
  callback: (waypoints: Waypoint[]) => void
) => {
  const q = query(collection(db, collectionName), orderBy('stopNumber'));
  return onSnapshot(q, (snapshot) => {
    const waypoints = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Waypoint[];
    callback(waypoints);
  });
};

export const addWaypoint = async (
  collectionName: string,
  data: Omit<Waypoint, 'id'>
) => {
  await addDoc(collection(db, collectionName), data);
};

export const deleteWaypoint = async (collectionName: string, waypointId: string) => {
  await deleteDoc(doc(db, collectionName, waypointId));
};

export const updateWaypointStopNumber = async (
  collectionName: string,
  waypointId: string,
  stopNumber: number
) => {
  await updateDoc(doc(db, collectionName, waypointId), { stopNumber });
};

export const updateWaypointMedia = async (
  collectionName: string,
  waypointId: string,
  images: MediaItem[]
) => {
  await updateDoc(doc(db, collectionName, waypointId), { images });
};

// ─── Guest Comments ─────────────────────────────────────────────

export const addGuestComment = async (name: string, comment: string) => {
  await addDoc(collection(db, 'guestComments'), {
    name,
    comment,
    createdAt: serverTimestamp(),
  });
};

export const fetchGuestComments = async (): Promise<GuestComment[]> => {
  const snapshot = await getDocs(collection(db, 'guestComments'));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      comment: data.comment,
      createdAt: data.createdAt?.toDate() ?? null,
    };
  });
};

export const deleteGuestComment = async (commentId: string) => {
  await deleteDoc(doc(db, 'guestComments', commentId));
};

// ─── Trip Timer ─────────────────────────────────────────────────

export const storeStartTime = async (
  startTime: number,
  collectionName: string,
  documentId: string
) => {
  await setDoc(doc(db, collectionName, documentId), { startTime });
};

export const storeStopTime = async (
  stopTime: number,
  collectionName: string,
  documentId: string
) => {
  await setDoc(doc(db, collectionName, documentId), { stopTime }, { merge: true });
};

export const getTripTimes = async (
  collectionName: string,
  documentId: string
): Promise<TripTimes> => {
  const docSnap = await getDoc(doc(db, collectionName, documentId));
  if (!docSnap.exists()) return { startTime: null, stopTime: null };

  const data = docSnap.data();
  return {
    startTime: data.startTime ?? null,
    stopTime: data.stopTime ?? null,
  };
};
