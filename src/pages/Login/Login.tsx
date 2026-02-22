import React, { useState } from 'react';
import {
  IonPage,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      history.push('/home');
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-credential'
          ? 'Invalid email or password.'
          : err?.code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="btn-nav" onClick={() => history.push('/')}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>Admin Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="login-form">
          <IonInput
            value={email}
            placeholder="Email"
            onIonInput={(e) => setEmail(e.detail.value ?? '')}
            type="email"
            required
            className="login-input"
          />
          <IonInput
            value={password}
            placeholder="Password"
            onIonInput={(e) => setPassword(e.detail.value ?? '')}
            type="password"
            required
            className="login-input"
          />
          <IonButton
            className="btn-primary login-submit"
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Admin Login'}
          </IonButton>
        </div>

        <IonToast
          className="toastFail"
          isOpen={!!error}
          message={error}
          onDidDismiss={() => setError('')}
          duration={4000}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
