import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'

const Home: React.FC = () => {
  const history = useHistory();

  const goToPage = (myPage:string) => {
    history.push(`/${myPage}`);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hack the Highway!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <div className="button-container">
        <IonButton onClick={() => goToPage('map')}>Tour Map</IonButton>
        <IonButton onClick={() => goToPage('musicPlaylists')}>Music Playlists</IonButton>
        <IonButton onClick={() => goToPage('deepThoughts')}>Deep Thoughts</IonButton>
        
        <IonButton onClick={() => goToPage('dashboard')} className="bottom-button">Admin Login</IonButton>
      </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;