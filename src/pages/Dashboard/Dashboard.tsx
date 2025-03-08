import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const history = useHistory();

  const handleLogin = () => {
    // alert('Login');
    history.push('/Login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton onClick={handleLogin}>Admin Login</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
