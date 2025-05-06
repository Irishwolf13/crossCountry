import React, { useState } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './DeepThoughts.css';
import '../../theme/variables.css';
import Colbert from '../../components/Colbert';
import ActionMovies from '../../components/ActionMovies';
import ComedyMovies from '../../components/ComedyMovies';
import SuperPowers from '../../components/SuperPowers';

const DeepThoughts: React.FC = () => {
  const history = useHistory();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const images = [
    "https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FcolbertQuestion.jpg?alt=media&token=221be1e0-57c2-4e7d-b3ec-9b97ae537613",
    "https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FsuperPowersCoverSM.png?alt=media&token=e63de09e-8038-4e65-8474-0776dcc8681a",
    "https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FactionCoverSM.png?alt=media&token=a3ae3e1e-7601-418f-a334-695883756b6d",
    "https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FcomedyCoverSM.png?alt=media&token=3355db20-347d-4589-9c44-2e38ebe9a0df"
  ];
  const goToHome = () => {
    history.push('/home');
  };

  const handleOpenModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
  };

  // Example content for modals
  const modalContents = [
    { title: 'Colbert Questionert', description: '', component: <Colbert /> },
    { title: 'Super Powers', description: '', component: <SuperPowers />  },
    { title: 'Action Movies', description: '', component: <ActionMovies />},
    { title: 'Comedy Movies', description: '', component: <ComedyMovies /> }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="mapPageButton" onClick={goToHome}>Home</IonButton>
          </IonButtons>
          <IonTitle style={{ color: '#f7870f' }}>Deep Thoughts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="home-container">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FbackdropSky2.jpg?alt=media&token=c21edae9-5e3a-4d67-8b1c-2b5cb058d304" 
            alt="Background" 
            className="home-background-image"
          />
        </div>
        {[0, 1, 2, 3].map((index) => (
          <button 
            key={index} 
            className='colbertHolder' 
            onClick={() => handleOpenModal(index)}
          >
<img 
  src={images[index]} 
  alt={modalContents[index].title}
  className='colbertQuestionert'
/>
          </button>
        ))}
        
        {/* Modal */}
        <IonModal isOpen={selectedImageIndex !== null} onDidDismiss={handleCloseModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedImageIndex !== null ? modalContents[selectedImageIndex].title : ''}</IonTitle>
              <IonButtons slot="start">
                <IonButton className="mapPageButton" onClick={handleCloseModal}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedImageIndex !== null && (
              <div style={{ padding: '16px' }}>
                {/* <p>{modalContents[selectedImageIndex].description}</p> */}
                {/* Render the dynamic component */}
                {modalContents[selectedImageIndex].component}
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default DeepThoughts;
