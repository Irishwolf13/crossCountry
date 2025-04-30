import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config'; // Make sure this path is correct
import './Home.css';
import '../../theme/variables.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const goToPage = (myPage: string) => {
    history.push(`/${myPage}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/'); // Redirect to the homepage or login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hack the Highway!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        
        {isLoggedIn ? (
          <div>
            <IonButton onClick={() => goToPage('musicPlaylists')}>Music Playlists</IonButton>
            <IonButton onClick={() => goToPage('deepThoughts')}>Deep Thoughts</IonButton>
            <IonButton onClick={handleLogout} className="bottom-button">Logout</IonButton>
          </div>
        ) : (
          <IonButton onClick={() => goToPage('dashboard')} className="bottom-button">Admin Login</IonButton>
        )}
        <IonButton onClick={() => goToPage('map')}>Tour Map</IonButton>
        <IonButton onClick={() => goToPage('signGuestBook')} className="bottom-button">Sign Guest Book</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
