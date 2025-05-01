import React, { useState, useEffect } from 'react';
import { IonButton } from '@ionic/react';
import { storeStartTime, storeStopTime, getTripTimes } from '../firebase/firebaseController';
import { auth } from '../firebase/config';
import './MainTimer.css'

interface MainTimerProps {
  collectionName: string;
  documentId: string;
}

const MainTimer: React.FC<MainTimerProps> = ({ collectionName, documentId }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    const initializeClock = async () => {
      const tripData = await getTripTimes(collectionName, documentId);
      
      if (tripData?.startTime) {
        if (!tripData.stopTime) {
          // If there's a start time but no stop time, start the clock
          startClock(tripData.startTime);
        } else {
          // Calculate the difference if both start and stop times are available
          const differenceInSeconds = Math.floor((tripData.stopTime - tripData.startTime) / 1000);
          setElapsedTime(differenceInSeconds);
        }
      } else {
        setElapsedTime(0); // Reset or keep elapsed time to zero if no start time
      }
    };

    initializeClock();
    
    return () => {
      // Ensure timer is cleared on unmount
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [collectionName, documentId]); // Add dependencies here

  const startClock = async (existingStartTime?: number) => {
    const currentStartTime = existingStartTime || Date.now();

    if (!existingStartTime) {
      await storeStartTime(currentStartTime, collectionName, documentId);
    }

    // Clear any existing intervals before setting a new one
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - currentStartTime) / 1000));
    }, 1000);

    setTimerInterval(interval);
  };

  const stopClock = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    const stopTime = Date.now();
    await storeStopTime(stopTime, collectionName, documentId);

    const tripData = await getTripTimes(collectionName, documentId);
    if (tripData?.startTime && tripData?.stopTime) {
      const differenceInSeconds = Math.floor((tripData.stopTime - tripData.startTime) / 1000);
      setElapsedTime(differenceInSeconds);
    }
  };

  const formatElapsedTime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= (24 * 3600);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className='tripTimer'>
      <div>Total Time: {formatElapsedTime(elapsedTime)}</div>
      {isLoggedIn && isAuthorizedUser && (
        <>
          <button className='adminButton' onClick={() => startClock()}>Start Trip</button>
          <button className='adminButton' onClick={stopClock}>Stop Trip</button>
        </>
      )}
    </div>
  );
};

export default MainTimer;
