import React, { useRef, useState, useEffect } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './MainMap.css';
import MapWithDirections from '../../components/MapComponent';

const SONGS = [
  'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/music%2FOnTheRoadAgain.mp3?alt=media&token=6c0f313f-8f11-4690-a306-0e77fd51d9c7',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
];

const MainMap: React.FC = () => {
  const history = useHistory();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = SONGS[currentSongIndex];
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentSongIndex]);

  const goToHome = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    history.push('/home');
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNextSong = () => {
    setCurrentSongIndex((i) => (i + 1) % SONGS.length);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="btn-nav" onClick={goToHome}>Home</IonButton>
          </IonButtons>
          <IonButtons slot="end" className="map-audio-controls">
            <IonButton className="btn-nav" onClick={togglePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </IonButton>
            <IonButton className="btn-nav" onClick={handleNextSong}>Skip</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="map-container">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FHackTheHighway.png?alt=media&token=d1ae4112-a37b-4ba6-a04a-916d662270f1"
            alt="Hack the Highway"
            className="map-overlay-logo"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FdanUncleJohn.png?alt=media&token=6fcb4820-8d4e-402e-9b87-62e487ca88dc"
            alt="Dan and Uncle John"
            className="map-overlay-characters"
          />
          <img
            src="https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2Fdriving2.png?alt=media&token=71866b16-0bb7-4ede-86be-9aca9083796a"
            alt="Car"
            className="map-overlay-car"
          />
          <MapWithDirections />
          <audio ref={audioRef} onEnded={handleNextSong} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainMap;
