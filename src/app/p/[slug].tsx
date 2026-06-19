import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function PublicProfileScreen() {
  const { slug } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, title, company, avatar_url, connections, whatsapp, instagram, linkedin, facebook, website')
        .eq('slug', slug as string)
        .limit(1)
        .single();

      if (data) {
        setProfile(data);
        const { data: userPosts } = await supabase
          .from('posts')
          .select('*')
          .eq('profile_id', data.id)
          .order('created_at', { ascending: false })
          .limit(20);
        setPosts(userPosts || []);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    if (slug) loadProfile();
  }, [slug]);

  function openLink(url: string) {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  }

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

  const hasSocial = profile?.whatsapp || profile?.instagram || profile?.linkedin || profile?.facebook || profile?.website;

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

        {hasSocial && (
          <View style={styles.socialRow}>
            {profile?.whatsapp && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(`https://wa.me/${profile.whatsapp}`)}>
                <Text style={styles.socialIcon}>💬</Text>
                <Text style={styles.socialLabel}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {profile?.instagram && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(`https://instagram.com/${profile.instagram}`)}>
                <Text style={styles.socialIcon}>📷</Text>
                <Text style={styles.socialLabel}>Instagram</Text>
              </TouchableOpacity>
            )}
            {profile?.linkedin && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(profile.linkedin)}>
                <Text style={styles.socialIcon}>💼</Text>
                <Text style={styles.socialLabel}>LinkedIn</Text>
              </TouchableOpacity>
            )}
            {profile?.facebook && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(profile.facebook)}>
                <Text style={styles.socialIcon}>👥</Text>
                <Text style={styles.socialLabel}>Facebook</Text>
              </TouchableOpacity>
            )}
            {profile?.website && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(profile.website)}>
                <Text style={styles.socialIcon}>🌐</Text>
                <Text style={styles.socialLabel}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.postsSection}>
        <Text style={styles.postsSectionTitle}>Posts</Text>
        {posts.length === 0 ? (
          <Text style={styles.noPosts}>No posts yet</Text>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postMiniAvatar}>
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.postMiniAvatarImg} />
                  ) : (
                    <Text style={styles.postMiniAvatarText}>{profile?.full_name?.charAt(0) || 'K'}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postName}>{profile?.full_name}</Text>
                  <Text style={styles.postTitle}>{profile?.title || ''}</Text>
                </View>
                <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
          ))
        )}
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
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 22 },
  socialBtn: { alignItems: 'center', backgroundColor: '#0A1628', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2E5FA3', minWidth: 80 },
  socialIcon: { fontSize: 24, marginBottom: 4 },
  socialLabel: { fontSize: 11, color: '#C9A84C', fontWeight: 'bold' },
  postsSection: { width: '90%', marginTop: 30 },
  postsSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 14, marginLeft: 4 },
  noPosts: { color: '#5A6E94', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  postCard: { backgroundColor: '#1A3A6B', borderRadius: 16, padding: 16, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  postMiniAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  postMiniAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  postMiniAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#0A1628' },
  postName: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  postTitle: { fontSize: 11, color: '#8899BB', marginTop: 1 },
  postTime: { fontSize: 12, color: '#5A6E94' },
  postContent: { fontSize: 15, color: '#E0E6F0', lineHeight: 22 },
  footer: { color: '#8899BB', fontSize: 12, marginTop: 30 },
});