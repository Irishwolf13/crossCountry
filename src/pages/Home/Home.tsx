import React from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'

const Home: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    history.push('/Login');
  };

  const goToUploadPage = () => {
    history.push('/uploadPhoto');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
      <IonButton onClick={goToUploadPage}>Upload Photos</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
