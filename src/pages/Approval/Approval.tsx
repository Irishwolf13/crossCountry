import React, { useEffect, useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Approval.css';
import '../../theme/variables.css';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

interface Waypoint {
  id: string;
  address: string;
  images: Array<{ approved: boolean; image: string }>;
  stopNumber: number;
}

const Approval: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  useEffect(() => {
    const fetchWaypoints = async () => {
      const q = query(collection(db, 'myWaypoints'));
      const querySnapshot = await getDocs(q);
      const waypointsData: Waypoint[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Waypoint, 'id'>;
        waypointsData.push({ id: doc.id, ...data });
      });
      setWaypoints(waypointsData);
    };

    fetchWaypoints();
    console.log(waypoints)
  }, []);

  const handleApprove = async (waypointId: string, imageIndex: number) => {
    const waypointRef = doc(db, 'myWaypoints', waypointId);
    const waypoint = waypoints.find(wp => wp.id === waypointId);
    if (waypoint) {
      const updatedImages = [...waypoint.images];
      updatedImages[imageIndex].approved = true;

      await updateDoc(waypointRef, { images: updatedImages });
      
      // Update local state
      setWaypoints(prevWaypoints => prevWaypoints.map(wp => 
        wp.id === waypointId ? { ...wp, images: updatedImages } : wp
      ));
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Approval Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonList>
  {waypoints.map((waypoint) => (
    waypoint.images.length > 0 ? (
      waypoint.images.map((imageObj, index) => (
        !imageObj.approved ? (
          <IonItem key={`${waypoint.id}-${index}`}>
            <IonLabel>
              <h2>{waypoint.address}</h2>
              <a href={imageObj.image} target="_blank" rel="noopener noreferrer">View Image</a>
            </IonLabel>
            {/* Uncomment the button below if you want to handle approval */}
            <IonButton onClick={() => handleApprove(waypoint.id, index)}>
              Approve
            </IonButton>
          </IonItem>
        ) : null
      ))
    ) : null
  ))}
</IonList>

      </IonContent>
    </IonPage>
  );
};

export default Approval;