import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage('Success! Welcome back.');
    setLoading(false);
  }

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage('Account created! Check your email.');
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoSection}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.tagline}>Your Verified Professional Identity</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome</Text>
        <Text style={styles.cardSub}>Sign in or create your account</Text>
        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="#8899BB"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#8899BB"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={signIn}
          disabled={loading}>
          <Text style={styles.loginBtnText}>
            {loading ? 'Loading...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupBtn}
          onPress={signUp}
          disabled={loading}>
          <Text style={styles.signupBtnText}>
            {loading ? 'Loading...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeInfoText}>
          ✓ Verified  •  🔒 Secure  •  🌍 Global
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  logoSection: { alignItems: 'center', paddingTop: 70, paddingBottom: 30 },
  logo: { fontSize: 48, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 10 },
  tagline: { fontSize: 13, color: '#8899BB', marginTop: 6 },
  card: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#2E5FA3' },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#8899BB', marginBottom: 24 },
  messageBox: { backgroundColor: '#0A1628', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#10B981' },
  messageText: { color: '#10B981', fontSize: 13 },
  label: { fontSize: 13, color: '#C9A84C', fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#0A1628', borderWidth: 1, borderColor: '#2E5FA3', borderRadius: 10, padding: 14, color: '#FFFFFF', fontSize: 15, marginBottom: 16 },
  loginBtn: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  loginBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 16 },
  signupBtn: { backgroundColor: '#1A3A6B', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  signupBtnText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 16 },
  badgeInfo: { alignItems: 'center', padding: 20 },
  badgeInfoText: { color: '#8899BB', fontSize: 12 },
});