import React, { useEffect, useState } from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';

declare global {
  interface Window { initMap: () => void; }
}

const MapWithDirections: React.FC = () => {
  const [waypoints, setWaypoints] = useState<{ location: string; stopover: boolean; id: string }[]>([]);
  const [newWaypoint, setNewWaypoint] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLocation, setModalLocation] = useState('');
  const [modalImages, setModalImages] = useState<string[]>([]);

    // Clean up images when the modal is closed
    useEffect(() => {
      if (!modalOpen) {
        setModalImages([]);
      }
    }, [modalOpen]);
  
  useEffect(() => {
    const fetchWaypointsFromDB = async () => {
      try {
        const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber'));
        const querySnapshot = await getDocs(q);
        const loadedWaypoints: { location: string; stopover: boolean; id: string }[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedWaypoints.push({
            location: data.address,
            stopover: true,
            id: doc.id, // Save document ID for fetching images later
          });
        });

        setWaypoints(loadedWaypoints);
      } catch (error) {
        console.error('Error fetching waypoints: ', error);
      }
    };

    fetchWaypointsFromDB();
  }, []);

  useEffect(() => {
    const initMapAndAutocomplete = () => {
      const map = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
        zoom: 6,
        center: { lat: 41.850033, lng: -87.6500523 },
      });
  
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true // Suppresses default markers.
      });
      directionsRenderer.setMap(map);
  
      if (waypoints.length > 0) {
        const origin = waypoints[0]?.location || '';
        const destination = waypoints[waypoints.length - 1]?.location || '';
  
        const geocoder = new window.google.maps.Geocoder();
  
        const setMarkerWithImages = (location:any, map:any, title:any) => {
          geocoder.geocode({ address: location }, async (results, status) => {
            if (status === 'OK' && results) {
              const marker = new window.google.maps.Marker({
                position: results[0].geometry.location,
                map: map,
                title: title
              });
  
              marker.addListener('click', async () => {
                setModalLocation(title);
                setModalOpen(true);
  
                try {
                  const docRef = collection(db, 'myWaypoints');
                  const waypointDoc = await getDocs(query(docRef));
                  const selectedWaypoint = waypointDoc.docs.find((doc) => doc.data().address === title);
                  if (selectedWaypoint) {
                    const data = selectedWaypoint.data();
                    setModalImages(data.images || []);
                  } else {
                    setModalImages([]);
                  }
                } catch (error) {
                  console.error('Error fetching images: ', error);
                  setModalImages([]);
                }
              });
            }
          });
        };
  
        // Set markers for origin, destination and waypoints
        setMarkerWithImages(origin, map, origin);
        setMarkerWithImages(destination, map, destination);
  
        const waypointsForMarkers = waypoints.slice(1, waypoints.length - 1);
        waypointsForMarkers.forEach(({ location }) => {
          setMarkerWithImages(location, map, location);
        });
  
        const waypointsForDirections = waypoints.slice(1, waypoints.length - 1).map(({ location }) => ({ location, stopover: true }));
  
        const request: google.maps.DirectionsRequest = {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints: waypointsForDirections,
        };
  
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        });
      }
  
      const autocompleteInput = document.getElementById('autocomplete-input') as HTMLInputElement;
      const autocompleteInstance = new window.google.maps.places.Autocomplete(autocompleteInput);
      setAutocomplete(autocompleteInstance);
  
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.formatted_address) {
          setNewWaypoint(place.formatted_address);
        }
      });
    };
  
    const loadGoogleMapsScript = () => {
      const existingScript = document.getElementById('google-maps');
      if (!existingScript) {
        const apiKey = import.meta.env.VITE_DEV_GOOGLE_KEY;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.id = 'google-maps';
        script.async = true;
        document.body.appendChild(script);
        window.initMap = initMapAndAutocomplete;
      } else {
        if (window.google && window.google.maps) {
          initMapAndAutocomplete();
        }
      }
    };
  
    loadGoogleMapsScript();
  
  }, [waypoints]);

  const isLocationInUSA = (results: any) => {
    if (!results || results.length === 0) return false;

    for (let component of results[0].address_components) {
      if (component.types.includes('country') && component.short_name === 'US') {
        return true;
      }
    }
    return false;
  };

  const handleAddWaypoint = async () => {
    if (newWaypoint.trim() === '') return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: newWaypoint }, async (results, status) => {
      if (results) {
        if (status === 'OK' && isLocationInUSA(results)) {
          try {
            const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber', 'desc'));
            const querySnapshot = await getDocs(q);
            const highestStopNumber = querySnapshot.docs.length ? querySnapshot.docs[0]?.data().stopNumber : 0;

            await addDoc(collection(db, 'myWaypoints'), {
              latitude: results[0].geometry.location.lat(),
              longitude: results[0].geometry.location.lng(),
              address: newWaypoint,
              stopNumber: highestStopNumber + 1,
              images: [] // Placeholder for any new waypoint images
            });

            setWaypoints([...waypoints, { location: newWaypoint, stopover: true, id: '' }]);
            setNewWaypoint('');
            if (autocomplete) autocomplete.getPlace();

          } catch (error) {
            console.error('Error adding waypoint: ', error);
          }
        } else {
          alert('The entered location is not within the USA.');
        }
      }
    });
  };

  const handleAddCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          const geocoder = new window.google.maps.Geocoder();
          const latLng = { lat: latitude, lng: longitude };

          geocoder.geocode({ location: latLng }, async (results, status) => {
            if (status === 'OK' && results && isLocationInUSA(results)) {
              const address = results[0].formatted_address;
              try {
                const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber', 'desc'));
                const querySnapshot = await getDocs(q);
                const highestStopNumber = querySnapshot.docs.length ? querySnapshot.docs[0].data().stopNumber : 0;

                await addDoc(collection(db, 'myWaypoints'), {
                  latitude,
                  longitude,
                  address,
                  stopNumber: highestStopNumber + 1,
                  images: [] // Placeholder for any new location images
                });

                setWaypoints([...waypoints, { location: address, stopover: true, id: '' }]);
              } catch (error) {
                console.error('Error adding waypoint: ', error);
              }
            } else {
              alert('The current location is not within the USA.');
            }
          });
        },
        (error) => {
          alert('Unable to retrieve your location. Please check your device settings.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div>
      <h3>Directions from Buffalo to Seattle with waypoints</h3>
      <div id="map" style={{ height: '50vh', width: '100%' }}></div>
      <div>
        <input
          id="autocomplete-input"
          type="text"
          value={newWaypoint}
          onChange={(e) => setNewWaypoint(e.target.value)}
          placeholder="Enter waypoint"
        />
        <IonButton onClick={handleAddWaypoint}>Add Waypoint</IonButton>
        <IonButton onClick={handleAddCurrentLocation}>Add Current Location</IonButton>
      </div>

      {/* Modal Implementation */}
      <IonModal isOpen={modalOpen} className='my-custom-class'>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{modalLocation}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {modalImages.length > 0 ? (
            modalImages.map((imageUrl, index) => (
              <img key={index} src={imageUrl} alt={`Waypoint ${modalLocation}`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
            ))
          ) : (
            <p>No images available for this location.</p>
          )}
          <IonButton onClick={() => setModalOpen(false)}>Close</IonButton>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default MapWithDirections;