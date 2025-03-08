import React, { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import '../../theme/variables.css'
import { uploadImage } from '../../firebase/firebaseController'; // Import the upload function
import { resizeAndCompressImage } from '../../utils/imageResizer'; // Import the image resizer utility

const Home: React.FC = () => {
  const history = useHistory();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLogin = () => {
    history.push('/Login');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (selectedFile) {
      setIsLoading(true);
      try {
        const resizedImageBlob = await resizeAndCompressImage(selectedFile);
        const resizedFile = new File([resizedImageBlob], selectedFile.name, {
          type: resizedImageBlob.type,
        });

        await uploadImage(resizedFile);
        console.log('File uploaded successfully:');
      } catch (error) {
        console.error('Error uploading file:', error);
        setErrorMessage('Error uploading file. Please try again.');
        setUploadFailed(true);
      } finally {
        setIsLoading(false);
        setUploadSuccess(true);
      }
    } else {
      setErrorMessage('You must select a file to upload');
      setUploadFailed(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>

        <input type="file" onChange={handleFileChange} />
        <IonButton onClick={handleLogin}>Admin Login</IonButton>
        <IonButton id="uploadingImage" onClick={handleImageUpload}>Upload Image</IonButton>
        <IonLoading isOpen={isLoading} message="Uploading Image..." onDidDismiss={() => setIsLoading(false)}/>
        
        <IonToast
          className='toastSuccess'
          isOpen={uploadSuccess}
          message="Upload Successful!! An Admin will review it before it is posted."
          onDidDismiss={() => setUploadSuccess(false)}
          duration={6000}
          buttons={[{ text: 'Dismiss', role: 'cancel', handler: () => { console.log('Dismiss clicked');} }]}
        ></IonToast>
        <IonToast
          className='toastFail'
          isOpen={uploadFailed}
          message={errorMessage}
          onDidDismiss={() => setUploadFailed(false)}
          duration={3000}
          buttons={[{ text: 'Dismiss', role: 'cancel', handler: () => { console.log('Dismiss clicked');} }]}
        ></IonToast>

      </IonContent>
    </IonPage>
  );
};

export default Home;
