import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    initMap: () => void;
  }
}

const MapWithDirections: React.FC = () => {
  const [waypoints, setWaypoints] = useState<{ location: string; stopover: boolean }[]>([]);
  const [newWaypoint, setNewWaypoint] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initMapAndAutocomplete = () => {
      const map = new window.google.maps.Map(document.getElementById('map') as HTMLElement, {
        zoom: 6,
        center: { lat: 41.850033, lng: -87.6500523 },
      });

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      const request: google.maps.DirectionsRequest = {
        origin: 'Buffalo, NY',
        destination: 'Seattle, WA',
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoints,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });

      // Initialize Autocomplete
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
        const apiKey = import.meta.env.VITE_DEV_GOOGLE_KEY; // Accessing the API key
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
        script.id = 'google-maps';
        script.async = true;
        document.body.appendChild(script);
        window.initMap = initMapAndAutocomplete;
      } else {
        // If script already exists, directly initialize map and autocomplete
        if (window.google && window.google.maps) {
          initMapAndAutocomplete();
        }
      }
    };

    loadGoogleMapsScript();

  }, [waypoints]); // Re-run effect when waypoints change

  const handleAddWaypoint = () => {
    if (newWaypoint.trim() === '') return;
    
    setWaypoints([...waypoints, { location: newWaypoint, stopover: true }]);
    setNewWaypoint('');
    if (autocomplete) autocomplete.getPlace(); // Clear autocomplete input
  };

  return (
    <div>
      <h3>Directions from Buffalo to Seattle with waypoints</h3>
      <div>
        <input
          id="autocomplete-input"
          type="text"
          value={newWaypoint}
          onChange={(e) => setNewWaypoint(e.target.value)}
          placeholder="Enter waypoint"
        />
        <button onClick={handleAddWaypoint}>Add Waypoint</button>
      </div>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
}

export default MapWithDirections;
