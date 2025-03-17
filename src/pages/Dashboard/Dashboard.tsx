import React, { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonReorderGroup, IonReorder, useIonViewWillEnter,} from '@ionic/react';
import { useAuth } from '../../firebase/AuthContext';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../../firebase/config';
import { collection, query, getDocs, orderBy, doc, deleteDoc, updateDoc,} from 'firebase/firestore';

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

  const fetchWaypoints = async () => {
    const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber'));
    const querySnapshot = await getDocs(q);
    const waypointList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Waypoint[];
    setWaypoints(waypointList);
  };

  // Use useIonViewWillEnter to fetch waypoints whenever the view is about to enter
  useIonViewWillEnter(() => {
    fetchWaypoints();
  });

  // Handle sign out
  const handleLogOut = () => {
    auth.signOut();
    history.push('/login');
  };

  const handleReorder = async (event: CustomEvent) => {
    const reorderedWaypoints = event.detail.complete(waypoints);

    // Update stopNumber based on new order
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

        <IonList>
          <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
            {waypoints.map((waypoint, index) => (
              <IonItem key={waypoint.id}>
                <IonLabel>
                  {index + 1}. {waypoint.address}
                </IonLabel>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(waypoint.id)}>
                  Delete
                </IonButton>
                <IonReorder slot="end" />
              </IonItem>
            ))}
          </IonReorderGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
