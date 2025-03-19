import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'
import MapWithDirections from '../../components/MapComponent';

const Home: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    history.push('/Login');
  };

  // const goToUploadPage = () => {
  //   history.push('/uploadPhoto');
  // };

  const goToLoginPage = () => {
    history.push('/dashboard');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={goToLoginPage}>Admin Login</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle>Hack the Highway Trip</IonTitle>
            
          </IonToolbar>
        </IonHeader>
      <MapWithDirections />
      {/* <IonButton onClick={goToUploadPage}>Upload Photo</IonButton> */}
      </IonContent>
    </IonPage>
  );
};

export default Home;
