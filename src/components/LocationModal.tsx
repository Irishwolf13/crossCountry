import React, { useRef, useState, useEffect } from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonButton, IonToast, IonButtons } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/bundle';
import { uploadImage, updateDocument } from '../firebase/firebaseController';
import ReactPlayer from 'react-player';
import { useAuth } from '../firebase/AuthContext';
import './LocationModal.css'

interface MediaData { image?: string; video?: string; likes: number; comments: string[]; title: string; uuid: string;}
interface LocationModalProps { isOpen: boolean; location: string; images: MediaData[]; waypointId: string | null; onClose: () => void; myMap:string}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, location, images: initialImages, waypointId, onClose, myMap }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<MediaData[]>(initialImages);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [videoPlayingStates, setVideoPlayingStates] = useState<{ [key: number]: boolean }>({});
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setImages(initialImages);
    }

    // Check if the current user is an admin
    const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
    if (user && user.email === adminEmail) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isOpen, initialImages, user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file); 
      if (!result) throw new Error("Failed to get download URL");

      const { downloadURL, uniqueFileName } = result;

      if (waypointId) {
        const updatedImages = [
          ...images,
          {
            image: downloadURL,
            uuid: uniqueFileName,
            likes: 0,
            comments: [],
            title: "New Image",
          },
        ];
        // @ts-ignore
        await updateDocument(myMap, waypointId, { images: updatedImages });

        setImages(updatedImages);

        setToastMsg("Image uploaded and Firestore updated successfully!");
      } else {
        setToastMsg("Waypoint ID is missing.");
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = (error as Error).message || "Could not upload image.";
      setToastMsg(errorMessage);
    }
  };

  const togglePlayPause = (index: number) => {
    setVideoPlayingStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const handleVideoEnded = (index: number) => {
    setVideoPlayingStates((prevState) => ({
      ...prevState,
      [index]: false
    }));
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="fullScreenModal">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton className="mapPageButton" onClick={onClose}>Close</IonButton>
              {isAdmin && (<IonButton className="mapPageButton" onClick={() => fileInputRef.current?.click()}>Upload</IonButton>)}
            </IonButtons>
            <div className='locationModalTitle'>{location ? `${location}` : 'Unknown'}</div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
        {isAdmin && (<input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />)}
          {images.length > 0 ? (
            <Swiper
              loop={true}
              grabCursor={true}
              pagination={true}
              modules={[Pagination]}
              className="mySwiper"
            >
              {images.map((item, index) => (
                <div>
                  <SwiperSlide key={index}>
                    <div>

                      {item.image ? (<img src={item.image} alt={`Image ${index + 1}`} className='frank' />) : item.video ? 
                      (
                        <>
                          <ReactPlayer 
                            url={item.video}
                            playing={!!videoPlayingStates[index]}
                            onEnded={() => handleVideoEnded(index)}
                            width='100%'
                            />
                          <div className="playButton">
                            <IonButton onClick={() => togglePlayPause(index)}>
                              {videoPlayingStates[index] ? 'Pause' : 'Play'}
                            </IonButton>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </SwiperSlide>
                </div>
              ))}
            </Swiper>
          ) : (
            <p>No media available for this location.</p>
          )}
          <div className='centerTitle'>Swipe left or right to view more!</div>
        </IonContent>
      </IonModal>
      <IonToast isOpen={!!toastMsg} onDidDismiss={() => setToastMsg('')} message={toastMsg} duration={2000} position="top"/>
    </>
  );
};

export default LocationModal;
