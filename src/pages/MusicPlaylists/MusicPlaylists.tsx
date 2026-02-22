import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './MusicPlaylists.css';

const PLAYLISTS = [
  { id: '3sz9bL604aa9Uy9U8Z7xmj', name: 'Hack the Highway' },
  { id: '72Uoqg5XweiivRRYFpBa3z', name: 'Hack the Pubs' },
];

const MusicPlaylists: React.FC = () => {
  const history = useHistory();
  const [currentPlaylist, setCurrentPlaylist] = useState(PLAYLISTS[0].id);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="btn-nav" onClick={() => history.push('/home')}>
              Home
            </IonButton>
          </IonButtons>
          <IonTitle style={{ color: 'var(--color-primary)' }}>Road Tunes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="playlist-controls">
          <label htmlFor="playlist-select">Select Playlist:</label>
          <select
            id="playlist-select"
            value={currentPlaylist}
            onChange={(e) => setCurrentPlaylist(e.target.value)}
            className="playlist-dropdown"
          >
            {PLAYLISTS.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>
        <div className="playlist-embed">
          <iframe
            src={`https://open.spotify.com/embed/playlist/${currentPlaylist}?utm_source=generator`}
            width="100%"
            height="100%"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Playlist"
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MusicPlaylists;
