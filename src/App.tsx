// App.tsx
import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { AuthProvider } from './firebase/AuthContext';
import PrivateRoute from './firebase/PrivateRoute';

import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Approval from './pages/Approval/Approval';
import MainMap from './pages/MainMap/MainMap';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import UploadPhoto from './pages/UploadPhoto/UploadPhoto';
import MusicPlaylists from './pages/MusicPlaylists/MusicPlaylists';
import DeepThoughts from './pages/DeepThoughts/DeepThoughts';
import SignGuestBook from './pages/SignGuestBook/SignGuestBook';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <PrivateRoute exact path="/dashboard" component={Dashboard} />
          <PrivateRoute exact path="/approval" component={Approval} />
          <PrivateRoute exact path="/uploadStuff" component={UploadPhoto} />
          <Route path="/signGuestBook" component={SignGuestBook} />
      
          <Route exact path="/login" component={Login} />
          <Route exact path="/musicPlaylists" component={MusicPlaylists} />
          <Route exact path="/deepThoughts" component={DeepThoughts} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/map" component={MainMap} />
          <Route exact path="/" component={Home} />
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;