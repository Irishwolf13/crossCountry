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
import { EffectCube, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/bundle';
import { uploadImage, updateDocument } from '../firebase/firebaseController';

interface ImageData {
  image: string;
  likes: number;
  comments: string[];
  title: string;
  uuid: string;
  approved: boolean;
}

interface LocationModalProps {
  isOpen: boolean;
  location: string;
  images: ImageData[];
  waypointId: string | null;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, location, images: initialImages, waypointId, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setImages(initialImages);
    }
  }, [isOpen, initialImages]);

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
            approved: false,
          }
        ];
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

  const handleEditClick = (index: number, currentTitle: string) => {
    setIsEditing(index);
    setEditText(currentTitle);
  };

  const handleSaveBlur = async (index: number) => {
    if (waypointId && index !== null) {
      const updatedImages = [...images];
      updatedImages[index].title = editText;

      try {
        // @ts-ignore
        await updateDocument('myWaypoints', waypointId, { images: updatedImages });
        setImages(updatedImages);
        setToastMsg("Title updated successfully!");
      } catch (error) {
        console.error('Error updating title:', error);
        setToastMsg("Could not update title.");
      }
    }
    setIsEditing(null);
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={onClose}>Close</IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={() => fileInputRef.current?.click()}>Upload Image</IonButton>
            </IonButtons>
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

          {location ? `${location}` : location || 'Unknown'}

          {images.filter(item => item.approved).length > 0 ? (
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
    {images.filter(item => item.approved).map((item, index) => (
      <SwiperSlide key={index}>
        <div>
          {isEditing === index ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              style={{ width: '100%', resize: 'none', overflowWrap: 'break-word' }}
              onBlur={() => handleSaveBlur(index)}
            />
          ) : (
            <p
              onClick={() => handleEditClick(index, item.title)}
              style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', cursor: 'pointer' }}
            >
              {item.title}
            </p>
          )}
        </div>
        <img src={item.image} alt={`Image ${index + 1}`} style={{ maxWidth: '100%' }} />
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
