import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeScreen from '../../components/SafeScreen';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();

  const {checkAuth, user, token} = useAuthStore()

  useEffect(() => {
    checkAuth();
  }, [])

  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if(!isSignedIn && !inAuthScreen) router.replace("/(auth)")
    else if(isSignedIn && inAuthScreen) router.replace("/(tabs)")
  }, [user, token, segments])

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="signup" />
        </Stack>
        <StatusBar style='dark' />
      </SafeScreen>
    </SafeAreaProvider>
  );
}