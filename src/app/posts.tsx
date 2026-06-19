import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function PostsScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEverything();
  }, []);

  async function loadEverything() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(prof);
    await loadPosts();
    setLoading(false);
  }

  async function loadPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(full_name, title, avatar_url, slug)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPosts(data || []);
  }

  async function handlePost() {
    if (!newPost.trim() || !profile) return;
    setPosting(true);
    const { error } = await supabase.from('posts').insert({
      profile_id: profile.id,
      content: newPost.trim(),
    });
    setPosting(false);
    if (!error) {
      setNewPost('');
      await loadPosts();
    }
  }

  async function handleDelete(postId: string) {
    const confirmed = typeof window !== 'undefined' ? window.confirm('هل تريد حذف هذا المنشور؟') : true;
    if (!confirmed) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      await loadPosts();
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
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#C9A84C" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerSub}>Community Feed</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.composer}>
            <View style={styles.composerTop}>
              <View style={styles.miniAvatar}>
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.miniAvatarImg} />
                ) : (
                  <Text style={styles.miniAvatarText}>{profile?.full_name?.charAt(0) || 'K'}</Text>
                )}
              </View>
              <TextInput
                style={styles.composerInput}
                placeholder="Share something with your network..."
                placeholderTextColor="#5A6E94"
                value={newPost}
                onChangeText={setNewPost}
                multiline
              />
            </View>
            <TouchableOpacity
              style={[styles.postBtn, !newPost.trim() && styles.postBtnDisabled]}
              onPress={handlePost}
              disabled={posting || !newPost.trim()}
            >
              {posting ? (
                <ActivityIndicator color="#0A1628" size="small" />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                {item.profiles?.avatar_url ? (
                  <Image source={{ uri: item.profiles.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{item.profiles?.full_name?.charAt(0) || '?'}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.postName}>{item.profiles?.full_name || 'Unknown'}</Text>
                <Text style={styles.postTitle}>{item.profiles?.title || ''}</Text>
              </View>
              <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
            </View>
            <Text style={styles.postContent}>{item.content}</Text>
            {profile && item.profile_id === profile.id && (
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtnText}>🗑 حذف</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  loadingWrap: { flex: 1, backgroundColor: '#0A1628', alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 14 },
  logo: { fontSize: 30, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 7 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4 },
  composer: { backgroundColor: '#1A3A6B', margin: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2E5FA3' },
  composerTop: { flexDirection: 'row', gap: 10 },
  miniAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  miniAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#0A1628' },
  composerInput: { flex: 1, color: '#FFFFFF', fontSize: 15, minHeight: 40, maxHeight: 120, textAlignVertical: 'top' },
  postBtn: { backgroundColor: '#C9A84C', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 15 },
  postCard: { backgroundColor: '#1A3A6B', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#0A1628' },
  postName: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  postTitle: { fontSize: 12, color: '#8899BB', marginTop: 1 },
  postTime: { fontSize: 12, color: '#5A6E94' },
  postContent: { fontSize: 15, color: '#E0E6F0', lineHeight: 22 },
  deleteBtn: { alignSelf: 'flex-end', marginTop: 10, paddingVertical: 4, paddingHorizontal: 10 },
  deleteBtnText: { color: '#FF6B6B', fontSize: 13, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#5A6E94', fontSize: 14 },
});