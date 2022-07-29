import Geolocation from 'react-native-geolocation-service';
import {useEffect, useState, useRef} from 'react';
import {Location} from '../interfaces/appInterfaces';

export const useLocation = () => {
  const [hasLocation, setHasLocation] = useState(false);
  const [routesLines, setRoutesLines] = useState<Location[]>([]);
  const [initialPosition, setInitialPosition] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });
  const [userLocation, setUserLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });

  const watchIdRef = useRef<number>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    getCurrentLocation().then(location => {
      if (!isMountedRef.current) {
        return;
      }

      setInitialPosition(location);
      setUserLocation(location);
      setRoutesLines(prevRoutesLines => [...prevRoutesLines, location]);
      setHasLocation(true);
    });
  }, []);

  const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        ({coords}) => {
          if (!isMountedRef.current) {
            return;
          }
          const {latitude, longitude} = coords;
          resolve({latitude, longitude});
        },
        error => reject(error),
        {
          enableHighAccuracy: true,
        },
      );
    });
  };

  const followUserLocation = () => {
    watchIdRef.current = Geolocation.watchPosition(
      ({coords}) => {
        const {latitude, longitude} = coords;
        setUserLocation({latitude, longitude});
        setRoutesLines(prevRoutesLines => [
          ...prevRoutesLines,
          {latitude, longitude},
        ]);
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      },
    );
  };

  const stopFollowingUserLocation = () => {
    if (watchIdRef.current) {
      Geolocation.clearWatch(watchIdRef.current);
    }
  };

  return {
    initialPosition,
    userLocation,
    routesLines,
    hasLocation,
    getCurrentLocation,
    followUserLocation,
    stopFollowingUserLocation,
  };
};
