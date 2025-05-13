import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Colors from '../../constant/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import styles from '../../assets/styles/index.styles';

const { width } = Dimensions.get('window');

export default function Home() {
  const [username, setUsername] = useState('Guest');
  const [news, setNews] = useState([]);
  const [pendingPickups, setPendingPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(true);
  const [showAllPending, setShowAllPending] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
      const response = await fetch('https://nagappon-server.onrender.com/api/pickups/pending');
      const data = await response.json();
      setPendingPickups(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching pickups:', error.message);
    } finally {
      setLoadingPickups(false);
    }
  };

  // Initial fetch and setup real-time updates
  useEffect(() => {
    fetchPendingPickups();

    // Set up interval for real-time updates (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchPendingPickups();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Update pickup status
  const updateStatus = async (id, newStatus) => {
    try {
      setLoadingPickups(true);
      await fetch(`https://nagappon-server.onrender.com/api/pickups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      // Fetch updated list immediately after status change
      await fetchPendingPickups();
    } catch (error) {
      console.error('Failed to update status:', error.message);
    } finally {
      setLoadingPickups(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[Colors.primary, '#2e7d32']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>NagaClean</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="white" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.usernameText}>{username} 👋</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.cardRow}>
          <BlurView intensity={20} style={[styles.card, { flex: 1 }]}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Total Collected</Text>
              <Text style={styles.cardCount}>10</Text>
              <Text style={styles.cardSubtext}>This month</Text>
            </View>
          </BlurView>

          <BlurView intensity={20} style={[styles.card, styles.blackCard]}>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: 'white' }]}>
                Waste Remaining
              </Text>
              <Progress.Circle
                size={80}
                progress={0.7}
                showsText={true}
                color={Colors.primary}
                thickness={8}
                textStyle={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}
                formatText={() => '70%'}
                unfilledColor="rgba(255,255,255,0.2)"
              />
            </View>
          </BlurView>
        </View>

        {/* Pending Requests */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchPendingPickups}
            >
              <Ionicons name="refresh" size={20} color={Colors.primary} />
              <Text style={styles.refreshText}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.collectedList}>
            {loadingPickups ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading requests...</Text>
              </View>
            ) : pendingPickups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.primary} />
                <Text style={styles.emptyText}>No pending requests</Text>
              </View>
            ) : (
              <>
                {(showAllPending ? pendingPickups : pendingPickups.slice(0, 1)).map((item, index) => (
                  <BlurView key={index} intensity={20} style={styles.collectedItems}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestTitle}>{item.reported_by || 'Unknown'}</Text>
                      <Text style={styles.requestTime}>{item.time}</Text>
                    </View>
                    <View style={styles.requestDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={20} color={Colors.primary} />
                        <Text style={styles.requestDetail}>{item.name}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={20} color={Colors.primary} />
                        <Text style={styles.requestDetail}>{item.description}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="trash" size={20} color={Colors.primary} />
                        <Text style={styles.requestDetail}>{item.wasteType}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={20} color={Colors.primary} />
                        <Text style={styles.requestDetail}>
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptBtn]}
                        onPress={() => updateStatus(item._id, 'accepted')}
                      >
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text style={styles.buttonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.declineBtn]}
                        onPress={() => updateStatus(item._id, 'declined')}
                      >
                        <Ionicons name="close" size={20} color="white" />
                        <Text style={styles.buttonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                ))}

                {pendingPickups.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setShowAllPending(!showAllPending)}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>
                      {showAllPending ? 'Show Less' : 'View All Requests'}
                    </Text>
                    <Ionicons 
                      name={showAllPending ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={Colors.primary} 
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>

        {/* Location Button */}
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={() => router.replace('create')}
        >
          <LinearGradient
            colors={[Colors.primary, '#2e7d32']}
            style={styles.locationButtonGradient}
          >
            <Ionicons name="location" size={24} color="white" />
            <Text style={styles.locationButtonText}>View My Location</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Environmental News */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🌍 Environmental News</Text>
          {news.length > 0 ? (
            news.map((item, index) => (
              <BlurView key={index} intensity={20} style={styles.newsCard}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsSource}>{item.source.name}</Text>
                  <Text style={styles.newsDate}>
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.readMoreButton}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={styles.readMoreText}>Read More</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </BlurView>
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading news...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
