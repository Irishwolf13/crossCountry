import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, orderBy, query, } from 'firebase/firestore';
import { IonButton } from '@ionic/react';

declare global { interface Window { initMap: () => void; }}

const MapWithDirections: React.FC = () => {
  const [waypoints, setWaypoints] = useState<{ location: string; stopover: boolean }[]>([]);
  const [newWaypoint, setNewWaypoint] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const fetchWaypointsFromDB = async () => {
      try {
        const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber'));
        const querySnapshot = await getDocs(q);
        const loadedWaypoints: { location: string; stopover: boolean }[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(doc.id)
          loadedWaypoints.push({
            location: data.address,
            stopover: true,
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
      const newMap = new window.google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          zoom: 6,
          center: { lat: 41.850033, lng: -87.6500523 },
        }
      );
      setMap(newMap);
  
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(newMap);
  
      const origin = 'Rochester, NY';
      const destination = 'Seattle, WA';
  
      if (waypoints.length > 0) {
        const request: google.maps.DirectionsRequest = {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints: waypoints,
        };
  
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            console.log(result);
            directionsRenderer.setDirections(result);
  
            // Marker for origin with alert
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: origin }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const originMarker = new window.google.maps.Marker({
                  position: results[0].geometry.location,
                  map: newMap,
                  title: 'Origin',
                  label: 'A', // Label for origin
                });
  
                originMarker.addListener('click', () => {
                  alert(`Origin Location: ${origin}`);
                });
              } else {
                console.error('Geocoding failed for origin:', status);
              }
            });
  
            // Markers for waypoints
            waypoints.forEach((waypoint, index) => {
              geocoder.geocode(
                { address: waypoint.location },
                (results, status) => {
                  if (status === 'OK' && results && results[0]) {
                    const marker = new window.google.maps.Marker({
                      position: results[0].geometry.location,
                      map: newMap,
                      title: `Waypoint ${index + 1}`,
                      label: String.fromCharCode(65 + index + 1), // Convert 0, 1, 2... to A, B, C...
                    });
  
                    // Add click listener to the marker
                    marker.addListener('click', () => {
                      alert(`Waypoint Location: ${waypoint.location}`);
                    });
                  } else {
                    console.error('Geocoding failed:', status);
                  }
                }
              );
            });
  
            // Marker for destination with alert
            geocoder.geocode({ address: destination }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const destinationMarker = new window.google.maps.Marker({
                  position: results[0].geometry.location,
                  map: newMap,
                  title: 'Destination',
                  label: 'End', // Label for destination
                });
  
                destinationMarker.addListener('click', () => {
                  alert(`Destination Location: ${destination}`);
                });
              } else {
                console.error('Geocoding failed for destination:', status);
              }
            });
          } else {
            console.error('Directions request failed due to ', status);
          }
        });
      }
  
      // Initialize autocomplete
      const autocompleteInput = document.getElementById(
        'autocomplete-input'
      ) as HTMLInputElement;
      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        autocompleteInput
      );
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
  
  const isLocationInUSA = (results:any) => {
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
      if(results) {
        if (status === 'OK' && isLocationInUSA(results)) {
          try {
            const q = query(collection(db, 'myWaypoints'), orderBy('stopNumber', 'desc'));
            const querySnapshot = await getDocs(q);
            const highestStopNumber = querySnapshot.docs.length ? querySnapshot.docs[0].data().stopNumber : 0;
    
            await addDoc(collection(db, 'myWaypoints'), {
              latitude: results[0].geometry.location.lat(),
              longitude: results[0].geometry.location.lng(),
              address: newWaypoint,
              stopNumber: highestStopNumber + 1,
            });
    
            setWaypoints([...waypoints, { location: newWaypoint, stopover: true }]);
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
  
          // Use Google Maps Geocoder API to convert coordinates into a human-readable address
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
                });
  
                setWaypoints([...waypoints, { location: address, stopover: true }]);
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
      <h3>Title</h3>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
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
    </div>
  );
}

export default MapWithDirections;
