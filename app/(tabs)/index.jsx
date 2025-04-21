import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import styles from '../../assets/styles/index.styles';

export default function Home() {
  const [username, setUsername] = useState('Guest');
  const [news, setNews] = useState([]);
  const [pendingPickups, setPendingPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(true);
  const [showAllPending, setShowAllPending] = useState(false); // NEW STATE

  // Load username from AsyncStorage
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        setUsername(storedUsername || 'Guest');
      } catch (error) {
        console.log('Error loading user details:', error.message);
      }
    };
    loadUserDetails();
  }, []);

  // Fetch environmental news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://newsapi.org/v2/everything?q=basura%20OR%20waste%20management%20OR%20garbage%20disposal&language=tl&pageSize=3&apiKey=9ddce8dc6ab6468b9af4576177c0fc64'
        );
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

  // Fetch pending pickup requests
  const fetchPendingPickups = async () => {
    try {
      const response = await fetch('http://192.168.100.73:10000/api/pickups/pending');
      const data = await response.json();
      setPendingPickups(data);
    } catch (error) {
      console.error('Error fetching pickups:', error.message);
    } finally {
      setLoadingPickups(false);
    }
  };

  useEffect(() => {
    fetchPendingPickups();
  }, []);

  // Update pickup status
  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://192.168.100.73:10000/api/pickups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      // Remove updated pickup from list
      setPendingPickups(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to update status:', error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NagaClean</Text>
      </View>

      {/* Welcome */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>Welcome, {username} 👋</Text>
        <Ionicons name="notifications" size={27} color={Colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Card Row */}
        <View style={styles.cardRow}>
          <View style={[styles.card, { flex: 1 }]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Collected</Text>
              <Text style={styles.cardCount}>10</Text>
            </View>
          </View>

          <View style={[styles.card, styles.blackCard]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: Colors.textPrimary }]}>
                Waste Remaining
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

        {/* Pending Requests */}
        <Text style={styles.recentTitle}>Pending Requests</Text>
        <View style={styles.collectedList}>
          {loadingPickups ? (
            <Text>Loading requests...</Text>
          ) : pendingPickups.length === 0 ? (
            <Text style={{ textAlign: 'center' }}>No pending requests found.</Text>
          ) : (
            <>
              {(showAllPending ? pendingPickups : pendingPickups.slice(0, 1)).map((item, index) => (
                <View key={index} style={styles.collectedItems}>
                  <Text style={styles.requestTitle}>{item.reported_by || 'Unknown'}</Text>
                  <Text style={styles.requestDetail}>📍 Place: {item.name}</Text>
                  <Text style={styles.requestDetail}>📍 Description: {item.description}</Text>
                  <Text style={styles.requestDetail}>🗑️ Waste Type: {item.wasteType}</Text>
                  <Text style={styles.requestDetail}>
                    📅 Schedule: {new Date(item.date).toLocaleDateString()} - {item.time}
                  </Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => updateStatus(item._id, 'accepted')}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineBtn}
                      onPress={() => updateStatus(item._id, 'declined')}
                    >
                      <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {pendingPickups.length > 1 && (
                <TouchableOpacity
                  onPress={() => setShowAllPending(!showAllPending)}
                  style={{
                    paddingVertical: 6,
                    alignSelf: 'center',
                    backgroundColor: Colors.primary,
                    borderRadius: 10,
                    paddingHorizontal: 16,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {showAllPending ? 'Collapse' : 'View All'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* View Location Button */}
        <TouchableOpacity style={styles.viewLocationBtn} onPress={() => router.replace('create')}>
          <Text style={styles.viewLocationText}>📍 View My Location</Text>
        </TouchableOpacity>

        {/* Environmental News */}
        <Text style={styles.recentTitle}>🌍 Environmental News</Text>
        {news.length > 0 ? (
          news.map((item, index) => (
            <View key={index} style={styles.newsCard}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsSource}>Source: {item.source.name}</Text>
              <Text style={styles.newsDate}>{new Date(item.publishedAt).toDateString()}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                <Text style={styles.readMore}>Read More →</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading news...</Text>
        )}
      </ScrollView>
    </View>
  );
}
