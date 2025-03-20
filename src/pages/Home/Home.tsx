import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'

const Home: React.FC = () => {
  const history = useHistory();

  const goToLoginPage = () => {
    history.push('/dashboard');
  };

  const goToMapPage = () => {
    history.push('/map');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end"></IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonButton onClick={goToLoginPage}>Admin Login</IonButton>
        <IonButton onClick={goToMapPage}>Tour Map</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;