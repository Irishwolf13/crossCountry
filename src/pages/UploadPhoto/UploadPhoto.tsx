import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonToast,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { uploadMedia } from '../../firebase/firebaseController';

const UploadPhoto: React.FC = () => {
  const history = useHistory();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      setToast({ message: 'Select a video first.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await uploadMedia(selectedFile, 'videos');
      setToast({ message: 'Video uploaded!', type: 'success' });
      setSelectedFile(null);
    } catch {
      setToast({ message: 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton className="btn-nav" onClick={() => history.goBack()}>
              Back
            </IonButton>
          </IonButtons>
          <IonTitle>Upload Video</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: 16 }}>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
          <IonButton className="btn-primary" onClick={handleUpload} disabled={isLoading}>
            Upload Video
          </IonButton>
        </div>

        <IonLoading isOpen={isLoading} message="Uploading..." />

        <IonToast
          className={toast?.type === 'success' ? 'toastSuccess' : 'toastFail'}
          isOpen={!!toast}
          message={toast?.message ?? ''}
          onDidDismiss={() => setToast(null)}
          duration={4000}
          buttons={[{ text: 'Dismiss', role: 'cancel' }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default UploadPhoto;
