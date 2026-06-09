import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function PublicProfileScreen() {
  const { slug } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, title, company, avatar_url, connections')
        .ilike('full_name', (slug as string).replace(/-/g, ' '))
        .limit(1)
        .single();

      if (data) {
        setProfile(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    if (slug) loadProfile();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.notFoundText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>KNOT</Text>
      <Text style={styles.headerSub}>Verified Professional Identity</Text>

      <View style={styles.card}>
        <View style={styles.avatar}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{profile?.full_name ? profile.full_name.charAt(0) : 'K'}</Text>
          )}
        </View>
        <Text style={styles.name}>{profile?.full_name}</Text>
        <Text style={styles.title}>{profile?.title}</Text>
        <Text style={styles.company}>{profile?.company} • Doha, Qatar</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Verified</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{profile?.connections ?? 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
      </View>

      <Text style={styles.footer}>Powered by KNOT</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#0A1628', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 8 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4, marginBottom: 30 },
  notFoundText: { color: '#FFFFFF', fontSize: 16, marginTop: 20 },
  card: { backgroundColor: '#1A3A6B', marginHorizontal: 20, borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C', width: '90%' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#0A1628' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  title: { fontSize: 15, color: '#C9A84C', marginBottom: 4 },
  company: { fontSize: 13, color: '#8899BB', marginBottom: 16 },
  badge: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  statBox: { alignItems: 'center', backgroundColor: '#0A1628', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#C9A84C' },
  statLabel: { fontSize: 12, color: '#8899BB', marginTop: 2 },
  footer: { color: '#8899BB', fontSize: 12, marginTop: 30 },
});