import React, { useState } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './MusicPlaylists.css';
import '../../theme/variables.css';

const MusicPlaylists: React.FC = () => {
  const history = useHistory();
  const [currentPlaylist, setCurrentPlaylist] = useState("3sz9bL604aa9Uy9U8Z7xmj");

  const goToHome = () => {
    history.push('/home');
  };
  
  const playlists = {
    playlist1: "3sz9bL604aa9Uy9U8Z7xmj",
    playlist2: "72Uoqg5XweiivRRYFpBa3z",
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="mapPageButton" onClick={goToHome}>Home</IonButton>
          </IonButtons>
          <IonTitle style={{ color: '#f7870f' }}>Road Tunes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className='selectionHolder'>
          <div>Select Playlist:</div>
          <div className='dropdownHolder'>
            <select 
              value={currentPlaylist} 
              onChange={(e) => setCurrentPlaylist(e.target.value)}
              className='playlistDropdown'
            >
              <option value={playlists.playlist1}>Hack the Highway</option>
              <option value={playlists.playlist2}>Hack the Pubs</option>
            </select>
          </div>

        </div>
        <div className='musicHolder'>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${currentPlaylist}?utm_source=generator`}
            width="100%"
            height="100%"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
          </iframe>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MusicPlaylists;
