import React, { useState, useRef } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css';

const Home: React.FC = () => {
  const history = useHistory();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  // Removed initial play logic
  const goToPage = (myPage: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    history.push(`/${myPage}`);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Retain volume and event listeners handling
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    const handleAudioEnd = () => {
      setIsPlaying(false);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnd);
      return () => {
        audioRef.current?.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [volume]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonButton onClick={() => goToPage('')} className="mapPageButton">Exit</IonButton>
          </IonButtons>
          <IonButtons className='volumeSpacer' slot='end'>
            <IonButton className="mapPageButton" onClick={togglePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </IonButton>
            <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
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
          <br></br>
          {/* <IonButton onClick={() => goToPage('deepThoughts')} className="HomePageButton">Deep Thoughts</IonButton> */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
