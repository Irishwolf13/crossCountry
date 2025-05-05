import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './MusicPlaylists.css';
import '../../theme/variables.css';

const MusicPlaylists: React.FC = () => {
  const history = useHistory();

  const goToHome = () => {
    history.push('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="mapPageButton" onClick={goToHome}>Home</IonButton>
          </IonButtons>
          <IonTitle  style={{color: '#f7870f'}}>Road Tunes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <iframe 
            src="https://open.spotify.com/embed/playlist/6G3DO2p33GcehtrJGYKJgA?utm_source=generator" 
            width="100%"
            height= '100%'
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
      </IonContent>
    </IonPage>
  );
};

export default MusicPlaylists;