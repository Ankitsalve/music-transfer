import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";

const BACKEND_URL = "http://YOUR_BACKEND_IP:5000"; // replace with your backend address

export default function App() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ spotify: false, google: false });

  useEffect(() => {
    // fetch login status from backend
    const fetchStatus = async () => {
      try {
        const sp = await axios.get(`${BACKEND_URL}/auth/spotify/token`, { withCredentials: true });
        const gd = await axios.get(`${BACKEND_URL}/auth/google/token`, { withCredentials: true });
        setStatus({ spotify: !!sp.data.spotify, google: !!gd.data.google });
      } catch (err) {
        console.warn(err.message);
      }
    };
    fetchStatus();
  }, []);

  const openAuth = async (provider) => {
    // opens the backend's OAuth start endpoint in a browser
    const url = `${BACKEND_URL}/auth/${provider}/login`;
    // open externally (redirect will come back to backend which redirects to EXPO)
    Linking.openURL(url);
  };

  const transfer = async () => {
    if (!link.trim()) {
      alert("Enter playlist link");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/transfer`, { link, type: "spotify_to_youtube" }, { withCredentials: true });
      alert(res.data.message + "\nYouTube playlist id: " + res.data.playlistId);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Music Transfer</Text>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <TouchableOpacity style={[styles.loginBtn, status.spotify ? styles.loggedIn : null]} onPress={() => openAuth("spotify")}>
          <Text style={styles.loginText}>Login Spotify</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.loginBtn, status.google ? styles.loggedInGoogle : null]} onPress={() => openAuth("google")}>
          <Text style={styles.loginText}>Login Google</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Paste Spotify playlist link"
        placeholderTextColor="#999"
        value={link}
        onChangeText={setLink}
      />

      <TouchableOpacity style={styles.transferBtn} onPress={transfer}>
        <Text style={styles.transferText}>Transfer Spotify → YouTube</Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={{ color: "#fff", marginTop: 8 }}>Working…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  loginBtn: {
    padding: 10,
    backgroundColor: "#333",
    marginHorizontal: 6,
    borderRadius: 8,
  },
  loggedIn: { backgroundColor: "#1DB954" },
  loggedInGoogle: { backgroundColor: "#4285F4" },
  loginText: { color: "#fff", fontWeight: "600" },
  input: { width: "90%", padding: 12, borderRadius: 10, backgroundColor: "#1e1e1e", color: "#fff", marginBottom: 16 },
  transferBtn: { backgroundColor: "#FF0000", padding: 14, borderRadius: 10, width: "90%", alignItems: "center" },
  transferText: { color: "#fff", fontWeight: "700" },
});
