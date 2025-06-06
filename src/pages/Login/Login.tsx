import React, { useState, useEffect } from 'react';
import { IonPage, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonTitle, IonToolbar, IonBackButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Clear the input fields when the user logs out
        setEmail('');
        setPassword('');
      }
    });

    return () => {
      // Unsubscribe from the onAuthStateChanged listener
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      history.push('/home');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const goToHome = () => {
    history.push('/');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="mapPageButton" onClick={goToHome}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Admin Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonInput
          value={email}
          placeholder="Email"
          onIonInput={(e) => setEmail(e.detail.value!)}
          type="email"
          required
        />
        <IonInput
          value={password}
          placeholder="Password"
          onIonInput={(e) => setPassword(e.detail.value!)}
          type="password"
          required
        />
        <IonButton className="addCommentButton" onClick={handleLogin}>Admin Login</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
