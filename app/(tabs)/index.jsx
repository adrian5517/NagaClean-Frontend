import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../constant/colors';
import { router } from 'expo-router';

export default function Home() {

  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const stored = await AsyncStorage.getItem('username');
        setUsername(stored || '');
        console.log(username);
      } catch (error) {
        console.log('Error loading username:', error.message);
      }
    };

    loadUsername();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {username} Mang Jose 👋</Text>
        <Ionicons name="notifications" size={27} color={Colors.primary} />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cards Row */}
        <View style={styles.cardRow}>
          {/* Total Collected Card */}
          <View style={[styles.card, { flex: 1 }]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Collected</Text>
              <Text style={styles.cardCount}>10</Text>
            </View>
          </View>

          {/* Garbage Remaining Card */}
          <View style={[styles.card, styles.blackCard]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: Colors.textPrimary }]}>
                Garbage Remaining
              </Text>
              <Progress.Circle
                size={80}
                progress={0.7}
                showsText={true}
                color={Colors.primary}
                thickness={8}
                textStyle={{ color: Colors.primary }}
                formatText={() => '70%'}
                unfilledColor="gray"
              />
            </View>
          </View>
        </View>

        
         {/* Pending Garbage */}
<Text style={styles.recentTitle}>Pending Requests</Text>
<View style={styles.collectedList}>
  <View style={styles.collectedItems}>
    <Text style={styles.requestTitle}>John Doe</Text>
    <Text style={styles.requestDetail}>📍 Location: Zone 1 ,Calauag, Naga City</Text>
    <Text style={styles.requestDetail}>🗑️ Waste Type: Biodegradable</Text>
    <Text style={styles.requestDetail}>📅 Schedule: April 20, 2025 - 8:00 AM</Text>
    
    {/* Optional Buttons */}
    <View style={styles.buttonRow}>
    <TouchableOpacity style={styles.acceptBtn} onPress={() => console.log('Accepted')}>
    <Text style={styles.buttonText}>Accept</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.declineBtn} onPress={() => console.log('Declined')}>
    <Text style={styles.buttonText}>Decline</Text>
    </TouchableOpacity>
    </View>
    </View>
    </View>

    <TouchableOpacity style={styles.viewLocationBtn} onPress={() => router.replace('create')}>
  <Text style={styles.viewLocationText}>📍 View My Location</Text>
</TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    padding: 15,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  scrollContainer: {
    padding: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.primary,
    height: 180,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  blackCard: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: Colors.white,
  },
  cardCount: {
    fontWeight: 'bold',
    fontSize: 65,
    color: Colors.white,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: COLORS.textDark,
    textAlign: 'left',
  },
  collectedItems: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  requestDetail: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight:500,
    marginBottom: 4,
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 12,
  },
  buttonText:{
    color:Colors.white,
  },
  
  acceptBtn: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  
  declineBtn: {
    backgroundColor: '#F44336',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  viewLocationBtn: {
    marginTop: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewLocationText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
