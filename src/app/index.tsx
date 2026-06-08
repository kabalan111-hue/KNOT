import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
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
        <Text style={styles.logo}>KNOT</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileCard}>
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
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>📱 Share My Identity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.profile_views ?? 0}</Text>
          <Text style={styles.statLabel}>Profile Views</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.connections ?? 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.posts ?? 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>

      <View style={styles.activityItem}>
        <Text style={styles.activityIcon}>👁️</Text>
        <View style={styles.activityInfo}>
          <Text style={styles.activityText}>12 people viewed your profile today</Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityItem}>
        <Text style={styles.activityIcon}>📱</Text>
        <View style={styles.activityInfo}>
          <Text style={styles.activityText}>Your QR was scanned 5 times at Qatar Forum</Text>
          <Text style={styles.activityTime}>5 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityItem}>
        <Text style={styles.activityIcon}>🤝</Text>
        <View style={styles.activityInfo}>
          <Text style={styles.activityText}>Ahmed Al-Rashid wants to connect</Text>
          <Text style={styles.activityTime}>Yesterday</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn}>
          <Text style={styles.quickIcon}>🆔</Text>
          <Text style={styles.quickText}>My QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn}>
          <Text style={styles.quickIcon}>🎪</Text>
          <Text style={styles.quickText}>Exhibitions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn}>
          <Text style={styles.quickIcon}>💼</Text>
          <Text style={styles.quickText}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn}>
          <Text style={styles.quickIcon}>✓</Text>
          <Text style={styles.quickText}>Verify</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 6 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { backgroundColor: '#1A3A6B', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18 },
  profileCard: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#0A1628' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  title: { fontSize: 14, color: '#C9A84C', marginBottom: 4 },
  company: { fontSize: 13, color: '#8899BB', marginBottom: 12 },
  badge: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  shareBtn: { backgroundColor: '#C9A84C', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center' },
  shareBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 15 },
  editBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9A84C', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  editBtnText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 20, borderRadius: 14, padding: 16, justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C' },
  statLabel: { fontSize: 11, color: '#8899BB', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2E5FA3' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 12 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 8, borderRadius: 12, padding: 14, gap: 12 },
  activityIcon: { fontSize: 24 },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 13, color: '#FFFFFF', fontWeight: 'bold' },
  activityTime: { fontSize: 11, color: '#8899BB', marginTop: 2 },
  quickActions: { flexDirection: 'row', marginHorizontal: 20, marginTop: 12, marginBottom: 30, gap: 10 },
  quickBtn: { flex: 1, backgroundColor: '#1A3A6B', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2E5FA3' },
  quickIcon: { fontSize: 26, marginBottom: 6 },
  quickText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
});