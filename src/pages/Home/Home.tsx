import React from 'react';
import { IonButton, IonContent, IonHeader, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../firebase/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const { user, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const goToPage = (page: string) => history.push(`/${page}`);

  return (
    <IonPage>
      <IonHeader />
      <IonContent>
        <div className="page-background">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FCrossCountrySplashEmpty.jpg?alt=media&token=c033784a-c12c-40cd-af44-549edde0dc60"
            alt="Background"
          />
        </div>

        <div className="home-hero">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FdanUncleJohn.png?alt=media&token=6fcb4820-8d4e-402e-9b87-62e487ca88dc"
            alt="Dan and Uncle John"
            className="home-characters"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FHackTheHighway.png?alt=media&token=d1ae4112-a37b-4ba6-a04a-916d662270f1"
            alt="Hack the Highway"
            className="home-logo"
          />
        </div>

        <div className="home-nav">
          <IonButton onClick={() => goToPage('signGuestBook')} className="btn-primary home-btn">
            Sign Guestbook
          </IonButton>
          <IonButton onClick={() => goToPage('map')} className="btn-primary home-btn">
            Tour Maps
          </IonButton>
          <IonButton onClick={() => goToPage('musicPlaylists')} className="btn-primary home-btn">
            Road Tunes
          </IonButton>

          {user ? (
            <>
              {isAdmin && (
                <IonButton onClick={() => goToPage('dashboard')} className="btn-primary home-btn">
                  Dashboard
                </IonButton>
              )}
              <IonButton onClick={handleLogout} className="btn-primary home-btn">
                Logout
              </IonButton>
            </>
          ) : (
            <IonButton onClick={() => goToPage('dashboard')} className="btn-primary home-btn">
              Admin Login
            </IonButton>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
