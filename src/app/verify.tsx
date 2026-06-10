import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function VerifyScreen() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    }
    loadProfile();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.statusCard}>
        <View style={styles.bigBadge}>
          <Text style={styles.bigBadgeIcon}>✓</Text>
        </View>
        <Text style={styles.statusTitle}>You are Verified</Text>
        <Text style={styles.statusSub}>Your professional identity is confirmed on KNOT</Text>
      </View>

      <Text style={styles.sectionTitle}>What's Verified</Text>

      <View style={styles.itemCard}>
        <Text style={styles.itemIcon}>👤</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>Full Name</Text>
          <Text style={styles.itemValue}>{profile?.full_name || '—'}</Text>
        </View>
        <Text style={styles.itemCheck}>✓</Text>
      </View>

      <View style={styles.itemCard}>
        <Text style={styles.itemIcon}>💼</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>Title</Text>
          <Text style={styles.itemValue}>{profile?.title || '—'}</Text>
        </View>
        <Text style={styles.itemCheck}>✓</Text>
      </View>

      <View style={styles.itemCard}>
        <Text style={styles.itemIcon}>🏢</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLabel}>Company</Text>
          <Text style={styles.itemValue}>{profile?.company || '—'}</Text>
        </View>
        <Text style={styles.itemCheck}>✓</Text>
      </View>

      <Text style={styles.sectionTitle}>Why Verification Matters</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          A verified identity builds trust. When people see the verified badge, they know your professional information has been confirmed by KNOT.
        </Text>
      </View>

      <Text style={styles.footer}>Powered by KNOT</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backText: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold', width: 50 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  statusCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#10B981' },
  bigBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bigBadgeIcon: { fontSize: 44, color: '#FFFFFF', fontWeight: 'bold' },
  statusTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  statusSub: { fontSize: 13, color: '#8899BB', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 8, borderRadius: 12, padding: 16, gap: 12 },
  itemIcon: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 12, color: '#8899BB' },
  itemValue: { fontSize: 15, color: '#FFFFFF', fontWeight: 'bold', marginTop: 2 },
  itemCheck: { fontSize: 18, color: '#10B981', fontWeight: 'bold' },
  infoCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, borderRadius: 12, padding: 18 },
  infoText: { fontSize: 13, color: '#C9D3E8', lineHeight: 20 },
  footer: { color: '#8899BB', fontSize: 12, marginTop: 30, marginBottom: 30, textAlign: 'center' },
});