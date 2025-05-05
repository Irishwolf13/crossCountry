import React, { useEffect, useState } from 'react';
import { IonButton } from '@ionic/react';
import { auth, db } from '../firebase/config';
import { collection, addDoc, getDocs, orderBy, query, onSnapshot, where } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import LocationModal from './LocationModal';
import MainTimer from '../components/MainTimer';

declare global { interface Window { initMap: () => void; } }

interface Waypoint { location: string; stopover: boolean; id: string;}
interface ImageData { image: string; likes: number; comments: string[]; title: string; uuid: string;}

const MapWithDirections: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [newWaypoint, setNewWaypoint] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLocation, setModalLocation] = useState('');
  const [modalImages, setModalImages] = useState<ImageData[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const unsubscribeFromAuth = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);

      // Check if the user email is the authorized one
      const adminEmail = import.meta.env.VITE_DEV_ADMIN_EMAIL;
      if (user && user.email === adminEmail) {
        setIsAuthorizedUser(true); // User is authorized
      } else {
        setIsAuthorizedUser(false); // User is not authorized
      }
    });

    return () => unsubscribeFromAuth();
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      setModalImages([]);
    }
  }, [modalOpen]);

  //@ts-ignore
  useEffect(() => {
    const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber'));

    // Real-time listener for waypoints
    const unsubscribeFromWaypoints = onSnapshot(q, (querySnapshot) => {
      const loadedWaypoints: Waypoint[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedWaypoints.push({
          location: data.address,
          stopover: true,
          id: doc.id,
        });
      });

      setWaypoints(loadedWaypoints);
    }, (error) => {
      console.error('Error listening to waypoints: ', error);
    });

    return () => unsubscribeFromWaypoints;
  }, []);

  useEffect(() => {
    if (waypoints.length === 0) return;

    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
        zoom: 6,
        // center: { lat: 41.850033, lng: -87.6500523 },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true
      });
      directionsRenderer.setMap(map);

      const origin = waypoints[0]?.location || '';
      const destination = waypoints[waypoints.length - 1]?.location || '';

      const geocoder = new window.google.maps.Geocoder();

      const setMarkerWithImages = (
        location: any,
        map: any,
        title: string,
        id: string,
        customIcon?: string
      ) => {
        geocoder.geocode({ address: location }, async (results, status) => {
          if (status === 'OK' && results) {
            const markerOptions: google.maps.MarkerOptions = {
              position: results[0].geometry.location,
              map: map,
              title: title,
              zIndex: customIcon === secondToLastCustomIconUrl ? 2000 : 1000 // Higher zIndex for second-to-last
            };
      
            if (customIcon) {
              markerOptions.icon = {
                url: customIcon,
                scaledSize: new google.maps.Size(30, 40),
                anchor: new google.maps.Point(14, 35)
              };
            }
      
            const marker = new window.google.maps.Marker(markerOptions);
      
            marker.addListener('click', async () => {
              setModalLocation(title);
              setSelectedWaypointId(id);
              setModalOpen(true);
      
              try {
                const docRef = collection(db, 'myWaypoints');
                const waypointDoc = await getDocs(query(docRef));
                const selectedWaypoint = waypointDoc.docs.find(
                  (doc) => doc.data().address === title
                );
                if (selectedWaypoint) {
                  const data = selectedWaypoint.data();
                  const imagesData: ImageData[] = data.images || [];
                  setModalImages(imagesData);
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

      // Custom icon URLs
      const secondToLastCustomIconUrl = 'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2Fmarker2.png?alt=media&token=8fd33c6e-d56f-4e42-a168-ce44e8581b58';
      const destinationCustomIconUrl = 'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FmarkerMicrosoft.png?alt=media&token=c1abd52a-4fbb-44bd-b6d2-c81fac36484f';
      const originCustomIconUrl = 'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FmarkerRIT.png?alt=media&token=4f542b7b-bd56-415c-996c-3c742f097988'

      // Change the marker icon specifically for the second-to-last waypoint
      const waypointForCustomIcon = waypoints[waypoints.length - 2];
      setMarkerWithImages(waypointForCustomIcon.location, map, waypointForCustomIcon.location, waypointForCustomIcon.id, secondToLastCustomIconUrl);

      // Set custom icon for the last waypoint
      setMarkerWithImages(destination, map, destination, waypoints[waypoints.length - 1].id, destinationCustomIconUrl);

      // Set custom icon for the first (origin) waypoint
      setMarkerWithImages(origin, map, origin, waypoints[0].id, originCustomIconUrl);

      // Continue with other markers
      const waypointsForMarkers = waypoints.slice(1, waypoints.length - 2); // Exclude the second-to-last and last waypoint already processed
      waypointsForMarkers.forEach(({ location, id }) => {
        setMarkerWithImages(location, map, location, id);
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
    };

    const initAutocomplete = () => {
      const autocompleteInput = document.getElementById('autocomplete-input') as HTMLInputElement;
      if (autocompleteInput) {
        const autocompleteInstance = new window.google.maps.places.Autocomplete(autocompleteInput);
        setAutocomplete(autocompleteInstance);
    
        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          if (place.formatted_address) {
            setNewWaypoint(place.formatted_address);
          }
        });
      } else {
        console.warn("Autocomplete input element is not available.");
      }
    };
    
    const loadGoogleMapsScript = () => {
      const existingScript = document.getElementById('google-maps');
      if (!existingScript) {
        const apiKey = import.meta.env.VITE_DEV_GOOGLE_KEY;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.id = 'google-maps';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initMap();
          initAutocomplete();
        };
        document.body.appendChild(script);
      } else {
        if (window.google && window.google.maps) {
          initMap();
          initAutocomplete();
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
            const q = query(collection(db, 'myWaypoints'), where('stopNumber', '<', 9999), orderBy('stopNumber', 'desc'));
            const querySnapshot = await getDocs(q);
            const highestStopNumber = querySnapshot.docs.length ? querySnapshot.docs[0]?.data().stopNumber : 0;
  
            // Construct the new waypoint
            const newWaypointData = {
              latitude: results[0].geometry.location.lat(),
              longitude: results[0].geometry.location.lng(),
              address: newWaypoint,
              stopNumber: highestStopNumber + 1,
              images: []
            };
  
            // Update local state first
            setWaypoints((prevWaypoints) => [
              ...prevWaypoints.slice(0, -1),
              { location: newWaypoint, stopover: true, id: '' },
              prevWaypoints[prevWaypoints.length - 1]
            ]);
  
            // Add the waypoint to the database
            await addDoc(collection(db, 'myWaypoints'), newWaypointData);
            
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
                const q = query(collection(db, 'myWaypoints'), where('stopNumber', '<', 9999), orderBy('stopNumber', 'desc'));
                const querySnapshot = await getDocs(q);
                const highestStopNumber = querySnapshot.docs.length ? querySnapshot.docs[0].data().stopNumber : 0;
  
                const newWaypointData = {
                  latitude,
                  longitude,
                  address,
                  stopNumber: highestStopNumber + 1,
                  images: []
                };
  
                // Add the new waypoint at the second last position
                setWaypoints((prevWaypoints) => {
                  const waypointsWithoutLast = prevWaypoints.slice(0, -1);
                  return [
                    ...waypointsWithoutLast,
                    { location: address, stopover: true, id: '' },
                    prevWaypoints[prevWaypoints.length - 1] // Preserve the last destination
                  ];
                });
  
                await addDoc(collection(db, 'myWaypoints'), newWaypointData);
  
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
    <>
      <LocationModal
        isOpen={modalOpen}
        location={modalLocation}
        images={modalImages}
        waypointId={selectedWaypointId}
        onClose={() => setModalOpen(false)}
      />
      <div id="map" style={{ width: '100%', height: '70vh', border: '5px solid #FFA500', marginTop: '0vh' }}></div>

      <MainTimer collectionName={`startTripTimes`} documentId={'danAndUncleJohn'} />
      <div className='directionText'>
        <div>Click on Waypoints to</div>
        <div>see images and videos!</div>
      </div>

      {/* <TimeOnRoad collectionName={'startTripTimes'} documentId={'timeOnRoad'} /> */}
      {isLoggedIn && isAuthorizedUser && (
        <>
          <IonButton onClick={handleAddWaypoint}>Add Waypoint</IonButton>
          <IonButton onClick={handleAddCurrentLocation}>Add Current Location</IonButton>
          <input 
            id="autocomplete-input"
            type="text"
            placeholder="Enter a location"
            value={newWaypoint}
            onChange={(e) => setNewWaypoint(e.target.value)}
          />
        </>
      )}
    </>
  );
};

export default MapWithDirections;

