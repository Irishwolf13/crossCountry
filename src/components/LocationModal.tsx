import React, { useRef, useState, useEffect } from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonToast } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCube, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/bundle';
import { uploadImage, updateDocument } from '../firebase/firebaseController';

interface LocationModalProps {
  isOpen: boolean;
  location: string;
  images: string[];
  waypointId: string | null;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, location, images: initialImages, waypointId, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<string[]>(initialImages);
  const [toastMsg, setToastMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setImages(initialImages);
    }
  }, [isOpen, initialImages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      if (!url) throw new Error("Failed to get download URL");

      if (waypointId) {
        const updatedImages = [...images, url];
        // @ts-ignore
        await updateDocument('myWaypoints', waypointId, { images: updatedImages });

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

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{location || 'Unknown Location'}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <IonButton onClick={onClose}>Close</IonButton>
          <IonButton onClick={() => fileInputRef.current?.click()}>Upload Image</IonButton>

          {images.length > 0 ? (
          <Swiper
          effect={'cube'}
          loop={true}
          grabCursor={true}
          cubeEffect={{
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
          }}
          pagination={true}
          modules={[EffectCube, Pagination]}
          className="mySwiper"
        >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <img src={image} alt={`Location Image ${index + 1}`} style={{ maxWidth: '100%' }} />
                <p>Frank</p>
              </SwiperSlide>
            ))}
          </Swiper>
          ) : (
            <p>No images available for this location.</p>
          )}
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={!!toastMsg}
        onDidDismiss={() => setToastMsg('')}
        message={toastMsg}
        duration={2000}
        position="top"
      />
    </>
  );
};

export default LocationModal;