import React from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'
import MapWithDirections from '../../components/MapComponent';

const Home: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    history.push('/Login');
  };

  const goToUploadPage = () => {
    history.push('/uploadPhoto');
  };

  const goToLoginPage = () => {
    history.push('/dashboard');
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
      <MapWithDirections />
      <IonButton onClick={goToUploadPage}>Upload Photo</IonButton>
      <IonButton onClick={goToLoginPage}>Admin Page</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
