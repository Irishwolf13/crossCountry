import React, { useRef, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './MainMap.css';
import '../../theme/variables.css';
import MapWithDirections from '../../components/MapComponent';

const MainMap: React.FC = () => {
  const history = useHistory();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5); // Initial volume set to 50%
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Array of song URLs
  const songs = [
    'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/music%2FOnTheRoadAgain.mp3?alt=media&token=6c0f313f-8f11-4690-a306-0e77fd51d9c7',
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  ];

  const goToHome = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    history.push('/home');
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Set initial volume
      audioRef.current.src = songs[currentSongIndex]; // Set the current song

      return () => {
        if (audioRef.current) {
          audioRef.current.pause(); // Pause audio on unmount
        }
      };
    }
  }, [currentSongIndex, volume]);

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

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  const handleSongEnd = () => {
    handleNextSong(); // Automatically play the next song on audio end
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="mapPageButton" onClick={goToHome}>Home</IonButton>
          </IonButtons>
          <IonButtons className='volumeSpacer' slot='end'>
            {/* <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} /> */}
            <IonButton className="mapPageButton" onClick={togglePlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </IonButton>
            <IonButton className="mapPageButton" onClick={handleNextSong}>Skip</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
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
          <audio ref={audioRef} onEnded={handleSongEnd} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainMap;
