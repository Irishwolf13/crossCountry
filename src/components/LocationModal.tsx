import React, { useRef, useState, useEffect } from 'react';
import {
  IonModal,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonToast,
  IonButtons,
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/bundle';
import { uploadMedia, updateWaypointMedia } from '../firebase/firebaseController';
import { useAuth } from '../firebase/AuthContext';
import type { MediaItem } from '../firebase/types';
import './LocationModal.css';

interface LocationModalProps {
  isOpen: boolean;
  location: string;
  images: MediaItem[];
  waypointId: string | null;
  onClose: () => void;
  collectionName: string;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  location,
  images: initialImages,
  waypointId,
  onClose,
  collectionName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<MediaItem[]>(initialImages);
  const [toastMsg, setToastMsg] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isOpen) setImages(initialImages);
  }, [isOpen, initialImages]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !waypointId) return;

    try {
      const { downloadURL, uniqueFileName } = await uploadMedia(file, 'images');
      const updated: MediaItem[] = [
        ...images,
        { image: downloadURL, uuid: uniqueFileName, likes: 0, title: 'New Image' },
      ];

      await updateWaypointMedia(collectionName, waypointId, updated);
      setImages(updated);
      setToastMsg('Image uploaded!');
    } catch (error) {
      setToastMsg((error as Error).message || 'Could not upload image.');
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="fullScreenModal">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton className="btn-nav" onClick={onClose}>Close</IonButton>
              {isAdmin && (
                <IonButton className="btn-nav" onClick={() => fileInputRef.current?.click()}>
                  Upload
                </IonButton>
              )}
            </IonButtons>
            <div className="modal-title">{location || 'Unknown'}</div>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {isAdmin && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          )}

          {images.length > 0 ? (
            <Swiper
              loop
              grabCursor
              pagination
              modules={[Pagination]}
              className="media-swiper"
            >
              {images.map((item, index) => (
                <SwiperSlide key={item.uuid || index}>
                  {item.image ? (
                    <img src={item.image} alt={`Image ${index + 1}`} className="media-image" />
                  ) : item.video ? (
                    <video controls className="media-video">
                      <source src={item.video} type="video/mp4" />
                      Your browser does not support video playback.
                    </video>
                  ) : null}
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p style={{ textAlign: 'center', padding: 24 }}>No media available for this location.</p>
          )}

          {images.length > 1 && (
            <div className="swipe-hint">Swipe left or right to view more!</div>
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
