import React from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../../firebase/AuthContext';
import { auth } from '../../firebase/config';

const Dashboard: React.FC = () => {
  const { user } = useAuth(); // Access the current user from the AuthContext

  const handleLogOut = () => {
    auth.signOut(); // Sign out from Firebase
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
        
        {/* Display the username if the user is authenticated */}
        {user ? (
          <p>{user.email || 'User'}</p>
        ) : (
          <p>Please log in to see your username.</p>
        )}

        <IonButton onClick={handleLogOut}>Admin LogOut</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
