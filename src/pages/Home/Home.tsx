import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
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
      <IonHeader></IonHeader>
      <IonContent>
        <div className='danUncleJohn'>
          <img 
            src='https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FdanUncleJohn.png?alt=media&token=6fcb4820-8d4e-402e-9b87-62e487ca88dc'
            alt='Dan and Uncle John'
          />
        </div>
        <div className="home-container">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FCrossCountrySplashEmpty.jpg?alt=media&token=c033784a-c12c-40cd-af44-549edde0dc60" 
            alt="Background" 
            className="home-background-image"
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
        <div className='home-ButtonHolder'>
          <IonButton onClick={() => goToPage('signGuestBook')} className="HomePageButton">Sign Guestbook</IonButton>
          <IonButton onClick={() => goToPage('musicPlaylists')} className="HomePageButton">Road Tunes</IonButton>
          <br></br>
          <IonButton onClick={() => goToPage('map')} className="HomePageButton">Tour Maps</IonButton>
          {isLoggedIn ? (
                  <div className='home-ButtonHolder'>
                    {isAuthorizedUser && (
                      <IonButton onClick={() => goToPage('dashboard')}  className="HomePageButton">Dashboard</IonButton>
                    )}
                    <IonButton onClick={handleLogout}  className="HomePageButton">Logout</IonButton>
                  </div>
                ) : (
                  <IonButton onClick={() => goToPage('dashboard')}  className="HomePageButton">Admin Login</IonButton>
                )}
          <br></br>
          {/* <IonButton onClick={() => goToPage('deepThoughts')} className="HomePageButton">Deep Thoughts</IonButton> */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
