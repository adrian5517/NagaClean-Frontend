import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Alert, Text, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions';

const Truck = require('../../assets/images/trucktopView.png');

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWRyaWFuNTUxNyIsImEiOiJjbTlyMHpubjYxcG9lMmtwdDVtc3FtaXRxIn0.6Qx1Pf_dIOCfRB7n7tWl1g';
const directionsClient = MapboxDirections({ accessToken: MAPBOX_TOKEN });

export default function Create() {
  const [location, setLocation] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const mapRef = useRef(null);

  // 1. Request permission and get current location
  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      setIsLocationPermissionGranted(true);
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    };

    requestLocationPermission();
  }, [refresh]);

  // 2. Fetch pickup locations from API
  useEffect(() => {
    const fetchPickupLocations = async () => {
      try {
        const response = await fetch('https://nagappon-server.onrender.com/api/pickups'); // Replace with your actual IP + port
        const data = await response.json();
        setPickupLocations(data);
      } catch (error) {
        console.error('Failed to fetch pickup locations:', error);
      }
    };

    fetchPickupLocations();
  }, [refresh]);

  // 3. Get route from current location to selected pickup
  useEffect(() => {
    const fetchDirections = async () => {
      if (selectedPickup && location) {
        const response = await directionsClient
          .getDirections({
            profile: 'driving',
            geometries: 'geojson',
            waypoints: [
              { coordinates: [location.longitude, location.latitude] },
              { coordinates: [selectedPickup.longitude, selectedPickup.latitude] },
            ],
          })
          .send();

        const route = response.body.routes[0];
        const geometry = route.geometry;

        const coords = geometry.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon,
        }));

        setRouteCoords(coords);
        setDistance(route.distance / 1000); // meters to km
        setDuration(route.duration / 60); // seconds to minutes

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: selectedPickup.latitude,
            longitude: selectedPickup.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    };

    fetchDirections();
  }, [selectedPickup, location, refresh]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: 13.6218,
          longitude: 123.1948,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
      >
        {/* User marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            image={Truck}
          />
        )}

        {/* Pickup Markers from API */}
        {pickupLocations.map((pickup, index) => (
          <Marker
            key={pickup._id || index}
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title={pickup.name}
            description={`📍 ${pickup.description}\n🗑 ${pickup.wasteType}\n📅 ${new Date(pickup.date).toLocaleDateString()} ${pickup.time}\n👤 ${pickup.reported_by}`}
            pinColor="red"
            onPress={() => setSelectedPickup(pickup)}
          />
        ))}

        {/* Route line */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
        )}
      </MapView>

      {/* Distance & ETA Info */}
      {distance && duration && selectedPickup && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Distance to {selectedPickup.name}: {distance.toFixed(2)} km | ETA: {duration.toFixed(1)} mins
          </Text>
        </View>
      )}

      {/* Refresh Button */}
      <Button title="Refresh Map" onPress={() => setRefresh(!refresh)} />

      {/* Permission Fallback */}
      {!isLocationPermissionGranted && (
        <View style={styles.permissionView}>
          <Text style={styles.permissionText}>Location permission is required</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionView: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -30 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
