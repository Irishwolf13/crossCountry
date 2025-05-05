import React from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './DeepThoughts.css';
import '../../theme/variables.css'

const DeepThoughts: React.FC = () => {
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
          <IonTitle style={{color: '#f7870f'}}>Deep Thoughts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <div  style={{color: '#f7870f'}}> By Jack Handy </div>
      </IonContent>
    </IonPage>
  );
};

export default DeepThoughts;