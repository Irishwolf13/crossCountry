import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonLoading, IonToast, IonBackButton, IonButtons } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './UploadPhoto.css';
import '../../theme/variables.css'
import { uploadImage, createDocument } from '../../firebase/firebaseController';
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

  useEffect(() => {
    getLocation()
    return () => { };
  }, []);

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

        const imageUrl = await uploadImage(resizedFile);
        handleCreateDocument(imageUrl, selectedFile.name);
  
        setUploadSuccess(true);
      } catch (error) {
        console.error('Error uploading file:', error);
        setErrorMessage('Error uploading file. Please try again.');
        setUploadFailed(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorMessage('You must select a file to upload');
      setUploadFailed(true);
    }
  };

  const handleCreateDocument = async (imageUrl:any, selectedFile:string) => {
    const metaData = {
        fileName: selectedFile,
        html: imageUrl,
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
    };
    try {
      await createDocument('userUploads', metaData);
      console.log("Document successfully created!");
      setUploadSuccess(true);
    } catch (e) {
      console.error("Error creating document: ", e);
      setErrorMessage('Error creating document. Please try again.');
      setUploadFailed(true);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString()
          }));
        },
        (error) => {
          console.error('Error obtaining location:', error.message);
          setErrorMessage(`Error obtaining location: ${error.message}`);
          setUploadFailed(true);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setErrorMessage('Geolocation is not supported by this browser.');
      setUploadFailed(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
            <IonButtons>
                <IonBackButton></IonBackButton>
                <IonTitle>UploadPhoto</IonTitle>
            </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">UploadPhoto</IonTitle>
          </IonToolbar>
        </IonHeader>

        <input type="file" onChange={handleFileChange} />
        <IonButton id="uploadingImage" onClick={handleImageUpload}>Upload Image</IonButton>
        <IonLoading isOpen={isLoading} message="Uploading Image..." onDidDismiss={() => setIsLoading(false)} />
        
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
        <div>{`${myLocation.latitude ?? "N/A"} - ${myLocation.longitude ?? "N/A"}`}</div>
      </IonContent>
    </IonPage>
  );
};

export default UploadPhoto;
