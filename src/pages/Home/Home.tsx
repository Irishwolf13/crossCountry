import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Home.css';
import '../../theme/variables.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAuthorizedUser, setIsAuthorizedUser] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);

      // Check if the user email matches the admin email
      const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
      if (user && user.email === adminEmail) {
        setIsAuthorizedUser(true); // User is authorized
      } else {
        setIsAuthorizedUser(false); // User is not authorized
      }
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
        <IonButton onClick={() => goToPage('map')}>Tour Map</IonButton>
        <IonButton onClick={() => goToPage('signGuestBook')} className="bottom-button">Sign Guest Book</IonButton>
        <IonButton onClick={() => goToPage('musicPlaylists')}>Music Playlists</IonButton>

        {isLoggedIn ? (
          <div>
            <IonButton onClick={() => goToPage('deepThoughts')}>Deep Thoughts</IonButton>
            {isAuthorizedUser && (
              <IonButton onClick={() => goToPage('dashboard')} className="bottom-button">Dashboard</IonButton>
            )}
            <IonButton onClick={handleLogout} className="bottom-button">Logout</IonButton>
          </div>
        ) : (
          <IonButton onClick={() => goToPage('dashboard')} className="bottom-button">Admin Login</IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
