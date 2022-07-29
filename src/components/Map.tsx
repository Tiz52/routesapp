import React, {useRef, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import MapView, {Polyline} from 'react-native-maps';
import {useLocation} from '../hooks/useLocation';
import {LoadingScreen} from '../pages/LoadingScreen';
import {Fab} from './Fab';

export const Map = () => {
  const {
    hasLocation,
    initialPosition,
    routesLines,
    userLocation,
    getCurrentLocation,
    followUserLocation,
    stopFollowingUserLocation,
  } = useLocation();
  const [showPolyline, setShowPolyline] = useState(false);
  const mapViewRef = useRef<MapView>(null);
  const followingRef = useRef<boolean>(true);

  useEffect(() => {
    followUserLocation();
    return () => stopFollowingUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!followingRef.current) {
      return;
    }

    const {latitude, longitude} = userLocation;
    mapViewRef.current?.animateCamera({
      center: {
        latitude,
        longitude,
      },
    });
  }, [userLocation]);

  const centerPosition = async () => {
    const {latitude, longitude} = await getCurrentLocation();

    followingRef.current = true;

    mapViewRef.current?.animateCamera({
      center: {
        latitude,
        longitude,
      },
    });
  };

  if (!hasLocation) {
    return <LoadingScreen />;
  }

  return (
    <>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: initialPosition!.latitude,
          longitude: initialPosition!.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onTouchStart={() => (followingRef.current = false)}>
        {showPolyline && (
          <Polyline
            coordinates={routesLines}
            strokeColor="black"
            strokeWidth={3}
          />
        )}
      </MapView>
      <Fab iconName="compass" onPress={centerPosition} style={styles.fab} />
      <Fab
        iconName="brush-outline"
        onPress={() => setShowPolyline(!showPolyline)}
        style={styles.polylineButton}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  polylineButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
  },
});
