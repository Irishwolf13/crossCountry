import React, { useState, useRef, useEffect } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css';

const Home: React.FC = () => {
  const history = useHistory();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume; // Set initial volume
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false)); // Handle autoplay restrictions

      return () => {
        if (audioRef.current) {
          audioRef.current.pause(); // Pause audio on unmount
        }
      };
    }
  }, []);

  useEffect(() => {
    const handleAudioEnd = () => {
      setIsPlaying(false);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnd);
      return () => {
        audioRef.current?.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, []);

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

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons className='volumeSpacer' slot='end'>
            <IonButton onClick={togglePlayPause}>
              {isPlaying ? 'Pause Music' : 'Play Music'}
            </IonButton>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
            <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonButton onClick={() => goToPage('map')}>Tour Map</IonButton>
        <IonButton onClick={() => goToPage('deepThoughts')}>Deep Thoughts</IonButton>
        <IonButton onClick={() => goToPage('musicPlaylists')}>Road Tunes</IonButton>
        <IonButton onClick={() => goToPage('signGuestBook')} className="bottom-button">Guestbook</IonButton>
        <IonButton onClick={() => goToPage('')} className="bottom-button">Exit</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
