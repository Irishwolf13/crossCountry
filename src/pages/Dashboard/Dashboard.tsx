import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonReorderGroup,
  IonReorder,
  useIonViewWillEnter,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebase/config';
import {
  subscribeToWaypoints,
  deleteWaypoint,
  updateWaypointStopNumber,
  updateWaypointMedia,
  uploadMedia,
} from '../../firebase/firebaseController';
import type { Waypoint, MediaItem } from '../../firebase/types';

const COLLECTIONS = {
  usa: 'myWaypoints',
  ireland: 'irelandWaypoints',
} as const;

type CollectionKey = keyof typeof COLLECTIONS;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();

  const [activeCollection, setActiveCollection] = useState<CollectionKey>('usa');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const collectionName = COLLECTIONS[activeCollection];

  useIonViewWillEnter(() => {
    const unsubscribe = subscribeToWaypoints(collectionName, setWaypoints);
    return () => unsubscribe();
  });

  const handleCollectionChange = (key: CollectionKey) => {
    setActiveCollection(key);
    subscribeToWaypoints(COLLECTIONS[key], setWaypoints);
  };

  const handleReorder = async (event: CustomEvent) => {
    const reordered: Waypoint[] = event.detail.complete(waypoints);
    setWaypoints(reordered);

    try {
      await Promise.all(
        reordered.map((wp, i) => updateWaypointStopNumber(collectionName, wp.id, i + 1))
      );
    } catch {
      setToast({ message: 'Failed to reorder waypoints.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWaypoint(collectionName, id);
      setToast({ message: 'Waypoint deleted.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete waypoint.', type: 'error' });
    }
  };

  const handleVideoUpload = async (waypointId: string) => {
    if (!selectedFile) {
      setToast({ message: 'Select a video first.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const { downloadURL, uniqueFileName } = await uploadMedia(selectedFile, 'videos');
      const waypoint = waypoints.find((wp) => wp.id === waypointId);
      if (!waypoint) throw new Error('Waypoint not found');

      const newMedia: MediaItem = {
        video: downloadURL,
        likes: 0,
        title: 'New Video',
        uuid: uniqueFileName,
      };

      await updateWaypointMedia(collectionName, waypointId, [...(waypoint.images || []), newMedia]);
      setToast({ message: 'Video uploaded!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to upload video.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {user && <p style={{ padding: '0 16px' }}>{user.email}</p>}

        <div style={{ padding: '0 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <IonButton className="btn-nav" onClick={() => history.push('/home')}>Home</IonButton>
          <IonButton className="btn-nav" onClick={() => { auth.signOut(); history.push('/login'); }}>
            Logout
          </IonButton>
          <IonButton
            className="btn-primary"
            color={activeCollection === 'ireland' ? 'medium' : undefined}
            onClick={() => handleCollectionChange('usa')}
          >
            USA Waypoints
          </IonButton>
          <IonButton
            className="btn-primary"
            color={activeCollection === 'usa' ? 'medium' : undefined}
            onClick={() => handleCollectionChange('ireland')}
          >
            Ireland Waypoints
          </IonButton>
        </div>

        <div style={{ padding: '8px 16px' }}>
          <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} accept="video/*" />
        </div>

        <IonList>
          <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
            {waypoints.map((wp, index) => (
              <IonItem key={wp.id}>
                <IonLabel>
                  {index + 1}. {wp.address}
                </IonLabel>
                <IonButton slot="end" className="btn-primary" onClick={() => handleVideoUpload(wp.id)}>
                  Upload Video
                </IonButton>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(wp.id)}>
                  Delete
                </IonButton>
                <IonReorder slot="end" />
              </IonItem>
            ))}
          </IonReorderGroup>
        </IonList>

        <IonLoading isOpen={isLoading} message="Uploading..." />

        <IonToast
          className={toast?.type === 'success' ? 'toastSuccess' : 'toastFail'}
          isOpen={!!toast}
          message={toast?.message ?? ''}
          onDidDismiss={() => setToast(null)}
          duration={4000}
          buttons={[{ text: 'Dismiss', role: 'cancel' }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
