import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Splash.css';
import '../../theme/variables.css';

const Splash: React.FC = () => {
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/'); // Redirect to the homepage or login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const goToPage = (myPage: string) => {
    history.push(`/${myPage}`);
  };

  return (
<IonPage>
  <IonContent>
    <div className="image-container">
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FbackdropSky1.jpg?alt=media&token=c76a40ab-01ea-4948-b9c1-d0b97956b9e1" 
        alt="Background" 
        className="background-image"
      />
    </div>
    <div className="wrapper">
      <div className="hackTheHighwaySign">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FHackTheHighway.png?alt=media&token=d1ae4112-a37b-4ba6-a04a-916d662270f1"
          alt="Hack the Highway sign"
        />
      </div>
    </div>
    <div className='splashButtonContainer'>
      <IonButton className='EnterButton' onClick={() => goToPage('home')}>Enter Hack The Highway</IonButton>
      {isLoggedIn ? (
        <div>
          {isAuthorizedUser && (
            <IonButton onClick={() => goToPage('dashboard')}  className='EnterButton'>Dashboard</IonButton>
          )}
          <IonButton onClick={handleLogout}  className='EnterButton'>Logout</IonButton>
        </div>
      ) : (
        <IonButton onClick={() => goToPage('dashboard')}  className='EnterButton2'>Admin Login</IonButton>
      )}
    </div>
    
  </IonContent>
</IonPage>

  );
};

export default Splash;
