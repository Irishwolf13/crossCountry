import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { storeStartTime, storeStopTime, getTripTimes } from '../firebase/firebaseController';
import './MainTimer.css';

interface MainTimerProps {
  collectionName: string;
  documentId: string;
}

const formatTime = (totalSeconds: number): string => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const MainTimer: React.FC<MainTimerProps> = ({ collectionName, documentId }) => {
  const { isAdmin } = useAuth();
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      const tripData = await getTripTimes(collectionName, documentId);

      if (tripData.startTime && !tripData.stopTime) {
        startClock(tripData.startTime);
      } else if (tripData.startTime && tripData.stopTime) {
        setElapsedTime(Math.floor((tripData.stopTime - tripData.startTime) / 1000));
      }
    };

    init();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [collectionName, documentId]);

  const startClock = async (existingStartTime?: number) => {
    const start = existingStartTime ?? Date.now();

    if (!existingStartTime) {
      await storeStartTime(start, collectionName, documentId);
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  };

  const stopClock = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const stopTime = Date.now();
    await storeStopTime(stopTime, collectionName, documentId);

    const tripData = await getTripTimes(collectionName, documentId);
    if (tripData.startTime && tripData.stopTime) {
      setElapsedTime(Math.floor((tripData.stopTime - tripData.startTime) / 1000));
    }
  };

  return (
    <div className="trip-timer">
      <div>Total Time: {formatTime(elapsedTime)}</div>
      {isAdmin && (
        <div className="trip-timer-controls">
          <button className="trip-timer-btn" onClick={() => startClock()}>Start Trip</button>
          <button className="trip-timer-btn" onClick={stopClock}>Stop Trip</button>
        </div>
      )}
    </div>
  );
};

export default MainTimer;
