import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from '@react-google-maps/api';
import { IonButton } from '@ionic/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../firebase/AuthContext';
import { subscribeToWaypoints } from '../firebase/firebaseController';
import type { Waypoint, MediaItem } from '../firebase/types';
import LocationModal from './LocationModal';
import MainTimer from './MainTimer';
import LoadingSpinner from './LoadingSpinner';

const LIBRARIES: ('places')[] = ['places'];

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '70vh',
  border: '5px solid #FFA500',
};

interface TourConfig {
  collection: string;
  label: string;
  originIcon: string;
  destinationIcon: string;
}

const TOURS: Record<string, TourConfig> = {
  ireland: {
    collection: 'irelandWaypoints',
    label: 'Ireland',
    originIcon:
      'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FmarkerIrishFlag.png?alt=media&token=e6d12f55-675a-4e7a-a77b-592bb0e621d7',
    destinationIcon:
      'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FmarkerClover.png?alt=media&token=4bbefd8d-99ee-4689-9f6d-9eb4e2b400eb',
  },
  usa: {
    collection: 'myWaypoints',
    label: 'Microsoft',
    originIcon:
      'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FmarkerRIT.png?alt=media&token=4f542b7b-bd56-415c-996c-3c742f097988',
    destinationIcon:
      'https://firebasestorage.googleapis.com/v0/b/crosscountry-98fb7.firebasestorage.app/o/website%2FmarkerMicrosoft.png?alt=media&token=c1abd52a-4fbb-44bd-b6d2-c81fac36484f',
  },
};

// Check if lat/lng is valid (not 0,0 or missing)
const hasValidCoords = (wp: Waypoint): boolean =>
  typeof wp.latitude === 'number' &&
  typeof wp.longitude === 'number' &&
  !(wp.latitude === 0 && wp.longitude === 0);

// Geocode a single address and return lat/lng
const geocodeAddress = (
  geocoder: google.maps.Geocoder,
  address: string
): Promise<{ lat: number; lng: number } | null> =>
  new Promise((resolve) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        resolve(null);
      }
    });
  });

const MapWithDirections: React.FC = () => {
  const { isAdmin } = useAuth();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_DEV_GOOGLE_KEY,
    libraries: LIBRARIES,
  });

  const [activeTour, setActiveTour] = useState<string>('ireland');
  const [rawWaypoints, setRawWaypoints] = useState<Waypoint[]>([]);
  const [resolvedWaypoints, setResolvedWaypoints] = useState<Waypoint[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [newWaypoint, setNewWaypoint] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLocation, setModalLocation] = useState('');
  const [modalImages, setModalImages] = useState<MediaItem[]>([]);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  const tour = TOURS[activeTour];

  // Subscribe to waypoints from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToWaypoints(tour.collection, setRawWaypoints);
    return () => unsubscribe();
  }, [tour.collection]);

  // Resolve any waypoints with missing/invalid lat/lng by geocoding their address
  useEffect(() => {
    if (!isLoaded || rawWaypoints.length === 0) {
      setResolvedWaypoints([]);
      return;
    }

    let cancelled = false;

    const resolveCoords = async () => {
      const geocoder = new google.maps.Geocoder();
      const resolved = await Promise.all(
        rawWaypoints.map(async (wp) => {
          if (hasValidCoords(wp)) return wp;

          const coords = await geocodeAddress(geocoder, wp.address);
          if (!coords) return wp;

          return { ...wp, latitude: coords.lat, longitude: coords.lng };
        })
      );

      if (!cancelled) {
        setResolvedWaypoints(resolved.filter(hasValidCoords));
      }
    };

    resolveCoords();
    return () => { cancelled = true; };
  }, [rawWaypoints, isLoaded]);

  // Calculate directions when resolved waypoints change
  useEffect(() => {
    if (!isLoaded || resolvedWaypoints.length < 2) {
      setDirections(null);
      return;
    }

    const origin = resolvedWaypoints[0].address;
    const destination = resolvedWaypoints[resolvedWaypoints.length - 1].address;

    const intermediateWaypoints = resolvedWaypoints.slice(1, -1).map((wp) => ({
      location: wp.address,
      stopover: true,
    }));

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        waypoints: intermediateWaypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, [resolvedWaypoints, isLoaded]);

  const handleMarkerClick = useCallback((wp: Waypoint) => {
    setModalLocation(wp.address);
    setSelectedWaypointId(wp.id);
    setModalImages(wp.images || []);
    setModalOpen(true);
  }, []);

  const getMarkerIcon = (index: number, total: number): google.maps.Icon | undefined => {
    const size = new google.maps.Size(30, 40);
    const anchor = new google.maps.Point(14, 37);

    if (index === 0) {
      return { url: tour.originIcon, scaledSize: size, anchor };
    }
    if (index === total - 1) {
      return { url: tour.destinationIcon, scaledSize: size, anchor };
    }
    return undefined;
  };

  const handleAddWaypoint = async () => {
    if (!newWaypoint.trim() || !isLoaded) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: newWaypoint }, async (results, status) => {
      if (status !== 'OK' || !results?.[0]) {
        alert('Could not find that location.');
        return;
      }

      const location = results[0].geometry.location;
      const highestStop = rawWaypoints.reduce((max, wp) => Math.max(max, wp.stopNumber), 0);

      await addDoc(collection(db, tour.collection), {
        latitude: location.lat(),
        longitude: location.lng(),
        address: newWaypoint,
        stopNumber: highestStop + 1,
        images: [],
      });

      setNewWaypoint('');
    });
  };

  const handleAddCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, async (results, status) => {
          if (status !== 'OK' || !results?.[0]) {
            alert('Could not determine your address.');
            return;
          }

          const highestStop = rawWaypoints.reduce((max, wp) => Math.max(max, wp.stopNumber), 0);

          await addDoc(collection(db, tour.collection), {
            latitude,
            longitude,
            address: results[0].formatted_address,
            stopNumber: highestStop + 1,
            images: [],
          });
        });
      },
      () => alert('Unable to retrieve your location. Check your device settings.')
    );
  };

  const onAutocompleteLoad = (ac: google.maps.places.Autocomplete) => {
    autocompleteRef.current = ac;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address) {
      setNewWaypoint(place.formatted_address);
    }
  };

  if (!isLoaded) return <LoadingSpinner />;

  const center = resolvedWaypoints.length > 0
    ? { lat: resolvedWaypoints[0].latitude, lng: resolvedWaypoints[0].longitude }
    : { lat: 40, lng: -74 };

  return (
    <>
      {/* Tour selector buttons */}
      {Object.entries(TOURS).map(([key, config]) => (
        <IonButton
          key={key}
          className={key === 'usa' ? 'map-tour-btn map-tour-btn-1' : 'map-tour-btn map-tour-btn-2'}
          onClick={() => setActiveTour(key)}
          style={{
            '--color': activeTour === key ? '#f7870f' : '#777',
            '--border-color': activeTour === key ? '#f7870f' : '#777',
          }}
        >
          {config.label}
        </IonButton>
      ))}

      <LocationModal
        isOpen={modalOpen}
        location={modalLocation}
        images={modalImages}
        waypointId={selectedWaypointId}
        onClose={() => setModalOpen(false)}
        collectionName={tour.collection}
      />

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        zoom={6}
        center={center}
        options={MAP_OPTIONS}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
          />
        )}

        {resolvedWaypoints.map((wp, index) => (
          <Marker
            key={wp.id}
            position={{ lat: wp.latitude, lng: wp.longitude }}
            title={wp.address}
            icon={getMarkerIcon(index, resolvedWaypoints.length)}
            zIndex={index === 0 || index === resolvedWaypoints.length - 1 ? 2000 : 1000}
            onClick={() => handleMarkerClick(wp)}
          />
        ))}
      </GoogleMap>

      {activeTour === 'usa' && (
        <MainTimer collectionName="startTripTimes" documentId="danAndUncleJohn" />
      )}

      <div className="map-hint">
        <div>Click on Waypoints to</div>
        <div>see images and videos!</div>
      </div>

      {isAdmin && (
        <div className="map-admin-controls">
          <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
            <input
              type="text"
              placeholder="Enter a location"
              value={newWaypoint}
              onChange={(e) => setNewWaypoint(e.target.value)}
              className="map-location-input"
            />
          </Autocomplete>
          <IonButton className="btn-primary" onClick={handleAddWaypoint}>
            Add Waypoint
          </IonButton>
          <IonButton className="btn-primary" onClick={handleAddCurrentLocation}>
            Add Current Location
          </IonButton>
        </div>
      )}
    </>
  );
};

export default MapWithDirections;
