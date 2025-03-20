import React, { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonReorderGroup, IonReorder, useIonViewWillEnter, IonLoading, IonToast } from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, getDocs, orderBy, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { uploadVideo } from '../../firebase/firebaseController';

// Define an interface for Waypoint
interface Waypoint {
  id: string;
  address: string;
  stopNumber: number;
  images: [];
  latitude: number;
  longitude: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  
  useIonViewWillEnter(() => {
    fetchWaypoints();
  });

  const fetchWaypoints = async () => {
    const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber'));
    const querySnapshot = await getDocs(q);
    const waypointList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Waypoint[];
    setWaypoints(waypointList);
  };

  const handleReorder = async (event: CustomEvent) => {
    const reorderedWaypoints = event.detail.complete(waypoints);
    for (let i = 0; i < reorderedWaypoints.length; i++) {
      await updateDoc(doc(db, 'myWaypoints', reorderedWaypoints[i].id), {
        stopNumber: i + 1,
      });
    }
    setWaypoints(reorderedWaypoints);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'myWaypoints', id));
    fetchWaypoints(); // Refresh the list after deletion
  };

  const handleLogOut = () => {
    auth.signOut();
    history.push('/login');
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleVideoUploadForWaypoint = async (waypointId: string) => {
    if (selectedFile) {
      setIsLoading(true);
      try {
        // @ts-ignore
        const { downloadURL, uniqueFileName } = await uploadVideo(selectedFile);
  
        // Create a new video object with UUID from the upload function
        const newVideoObject = {
          approved: false,
          video: downloadURL,
          likes: 0,
          title: "New Video",
          uuid: uniqueFileName, // Use the unique file name as UUID
        };
  
        // Get the document reference
        const waypointDocRef = doc(db, 'myWaypoints', waypointId);
  
        // Use the arrayUnion method for atomic updates without needing to fetch the entire document
        await updateDoc(waypointDocRef, {
          images: arrayUnion(newVideoObject),
        });
  
        setUploadSuccess(true);
        fetchWaypoints(); // Refresh the waypoints to reflect changes
      } catch (error) {
        console.error('Error uploading video:', error);
        setErrorMessage('Error uploading video. Please try again.');
        setUploadFailed(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMessage('You must select a video to upload');
      setUploadFailed(true);
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
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>

        {user ? <p>{user.email || 'User'}</p> : <p>Please log in to see your username.</p>}

        <IonButton onClick={() => history.push('/home')}>Home Page</IonButton>
        <IonButton onClick={handleLogOut}>Admin LogOut</IonButton>

        <input type="file" onChange={handleFileChange} accept="video/*" />
        <IonList>
          <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
            {waypoints.map((waypoint, index) => (
              <IonItem key={waypoint.id}>
                <IonLabel>
                  {index + 1}. {waypoint.address}
                </IonLabel>
                <IonButton slot="end" color="primary" onClick={() => handleVideoUploadForWaypoint(waypoint.id)}>
                  Upload Video
                </IonButton>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(waypoint.id)}>
                  Delete
                </IonButton>
                <IonReorder slot="end" />
              </IonItem>
            ))}
          </IonReorderGroup>
        </IonList>
        <IonLoading isOpen={isLoading} message="Uploading..." onDidDismiss={() => setIsLoading(false)} />
        <IonToast
          className='toastSuccess'
          isOpen={uploadSuccess}
          message="Action Successful!!"
          onDidDismiss={() => setUploadSuccess(false)}
          duration={6000}
          buttons={[{ text: 'Dismiss', role: 'cancel', handler: () => {} }]}
        />
        
        <IonToast
          className='toastFail'
          isOpen={uploadFailed}
          message={errorMessage}
          onDidDismiss={() => setUploadFailed(false)}
          duration={3000}
          buttons={[{ text: 'Dismiss', role: 'cancel', handler: () => {} }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
