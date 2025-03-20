import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'
import MapWithDirections from '../../components/MapComponent';

const Home: React.FC = () => {
  const history = useHistory();

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
          {/* <IonToolbar>
            <IonTitle>Hack the Highway Trip</IonTitle>
          </IonToolbar> */}
        </IonHeader>
        <div className="map-container">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FHackTheHighway.png?alt=media&token=d1ae4112-a37b-4ba6-a04a-916d662270f1"
            alt="Overlay"
            className="overlay-image"
          />
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FdanUncleJohn.png?alt=media&token=6fcb4820-8d4e-402e-9b87-62e487ca88dc"
            alt="Overlay"
            className="overlay-danJohn"
          />
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2Fdriving2.png?alt=media&token=71866b16-0bb7-4ede-86be-9aca9083796a"
            alt="Overlay"
            className="overlay-car"
          />
          <MapWithDirections />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
