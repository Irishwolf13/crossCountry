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
          <IonTitle>Hack the Highway!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <div className="button-container">
        <IonButton onClick={goToMapPage}>Tour Map</IonButton>
        <IonButton onClick={goToMapPage}>Music Playlists</IonButton>
        <IonButton onClick={goToMapPage}>Deep Thoughts</IonButton>
        <IonButton onClick={goToLoginPage} className="bottom-button">Admin Login</IonButton>
      </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;