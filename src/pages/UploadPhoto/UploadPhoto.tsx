import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLoading, IonToast, IonBackButton, IonButtons } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './UploadPhoto.css';
import '../../theme/variables.css';
import { uploadImage, uploadVideo, createDocument } from '../../firebase/firebaseController'; // Make sure uploadVideo is imported
import { resizeAndCompressImage } from '../../utils/imageResizer';

interface MyLocation { latitude: string | number; longitude: string | number }

const UploadPhoto: React.FC = () => {
  const history = useHistory();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadFailed, setUploadFailed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [myLocation, setMyLocation] = useState<MyLocation>({
    latitude: 0,
    longitude: 0,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleVideoUpload = async () => {
    if (selectedFile) {
      setIsLoading(true);
      try {
        const videoUrl = await uploadVideo(selectedFile);
        handleCreateDocument(videoUrl, "video");
        setUploadSuccess(true);
      } catch (error) {
        console.error('Error uploading video:', error);
        setErrorMessage('Error uploading video. Please try again.');
        setUploadFailed(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMessage('You must select a video to upload');
      setUploadFailed(true);
    }
  };

  const handleCreateDocument = async (fileUrl: any, fileType: string) => {
    const metaData = {
      fileName: selectedFile?.name || '',
      url: fileUrl,
      fileType,
      latitude: myLocation.latitude,
      longitude: myLocation.longitude,
    };
    try {
      // @ts-ignore
      await createDocument('userUploads', metaData);
      console.log("Document successfully created!");
      setUploadSuccess(true);
    } catch (e) {
      console.error("Error creating document: ", e);
      setErrorMessage('Error creating document. Please try again.');
      setUploadFailed(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons>
            <IonBackButton></IonBackButton>
            <IonTitle>Upload Video</IonTitle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Upload Video</IonTitle>
          </IonToolbar>
        </IonHeader>

        <input type="file" onChange={handleFileChange} />
        <IonButton onClick={handleVideoUpload}>Upload Video</IonButton>
        <IonLoading isOpen={isLoading} message="Uploading..." onDidDismiss={() => setIsLoading(false)} />
        <IonToast
          className='toastSuccess'
          isOpen={uploadSuccess}
          message="Action Successful!!"
          onDidDismiss={() => setUploadSuccess(false)}
          duration={6000}
          buttons={[{ text: 'Dismiss', role: 'cancel', handler: () => {} }]}
        ></IonToast>
        
        <IonToast
          className='toastFail'
          isOpen={uploadFailed}
          message={errorMessage}
          onDidDismiss={() => setUploadFailed(false)}
          duration={3000}
          buttons={[{ text: 'Dismiss', role: 'cancel', handler: () => {} }]}
        ></IonToast>
      </IonContent>
    </IonPage>
  );
};

export default UploadPhoto;
