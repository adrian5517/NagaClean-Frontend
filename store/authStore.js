import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  profilePictureLink: null, // Store the link to the profile picture
  isLoading: false,

  setUser: (user) => set({ user }),

  register: async (username, email, password, profilePictureLink) => {
    set({ isLoading: true });

    try {
      const response = await fetch("http://192.168.100.73:10000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, profilePictureLink }), // Include profilePictureLink in the body
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Store user, token, and profile picture link (URL)
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Store specific fields
      await AsyncStorage.setItem("username", data.user.username || "");
      await AsyncStorage.setItem("name", data.user.name || "");
      await AsyncStorage.setItem("profilePictureLink", data.user.profilePictureLink || ""); // Store link

      set({
        token: data.token,
        user: data.user,
        profilePictureLink: data.user.profilePictureLink || "", // Save the link to profile picture in state
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const response = await fetch("http://192.168.100.73:10000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // Store user, token, and profile picture link (URL)
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Store specific fields
      await AsyncStorage.setItem("username", data.user.username || "");
      await AsyncStorage.setItem("name", data.user.name || "");
      await AsyncStorage.setItem("profilePictureLink", data.user.profilePictureLink || ""); // Store link

      set({
        token: data.token,
        user: data.user,
        profilePictureLink: data.user.profilePictureLink || "", // Save the link in state
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const profilePictureLink = await AsyncStorage.getItem("profilePictureLink");

      set({ token, user, profilePictureLink }); // Load profilePictureLink along with token and user
    } catch (error) {
      console.log("Auth check failed", error);
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(["token", "user", "username", "name", "profilePictureLink"]); // Remove profilePictureLink from AsyncStorage
    set({ token: null, user: null, profilePictureLink: null }); // Clear profilePictureLink from state
  },
}));
