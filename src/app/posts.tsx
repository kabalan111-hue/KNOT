import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const REGIONS = [
  { key: 'all', label: 'General' },
  { key: 'qatar', label: 'Qatar' },
  { key: 'gcc', label: 'GCC' },
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'qatar', label: 'Qatar' },
  { key: 'gcc', label: 'GCC' },
];

function regionLabel(r: string) {
  if (r === 'qatar') return '🇶🇦 Qatar';
  if (r === 'gcc') return '🌍 GCC';
  return '📢 General';
}

export default function PostsScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postRegion, setPostRegion] = useState('all');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadEverything();
  }, []);

  async function loadEverything() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(prof);
    await loadPosts(prof?.id);
    setLoading(false);
  }

  async function loadPosts(myId: string) {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    const list = data || [];

    const authorIds = Array.from(new Set(list.map((p: any) => p.profile_id).filter(Boolean)));
    const profMap: Record<string, any> = {};
    if (authorIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, title, avatar_url')
        .in('id', authorIds);
      (profs || []).forEach((pr: any) => { profMap[pr.id] = pr; });
    }
    setPosts(list.map((p: any) => ({ ...p, profiles: profMap[p.profile_id] || null })));

    const { data: likeRows } = await supabase.from('post_likes').select('post_id, profile_id');
    const lk: Record<string, { count: number; liked: boolean }> = {};
    (likeRows || []).forEach((r: any) => {
      if (!lk[r.post_id]) lk[r.post_id] = { count: 0, liked: false };
      lk[r.post_id].count += 1;
      if (r.profile_id === myId) lk[r.post_id].liked = true;
    });
    setLikes(lk);

    const { data: commentRows } = await supabase.from('post_comments').select('post_id');
    const cc: Record<string, number> = {};
    (commentRows || []).forEach((r: any) => { cc[r.post_id] = (cc[r.post_id] || 0) + 1; });
    setCommentCounts(cc);
  }

  async function handlePost() {
    if (!newPost.trim() || !profile) return;
    setPosting(true);
    const { error } = await supabase.from('posts').insert({
      profile_id: profile.id,
      content: newPost.trim(),
      region: postRegion,
    });
    setPosting(false);
    if (!error) {
      setNewPost('');
      setPostRegion('all');
      await loadPosts(profile.id);
    }
  }

  async function handleDelete(postId: string) {
    const confirmed = typeof window !== 'undefined' ? window.confirm('هل تريد حذف هذا المنشور؟') : true;
    if (!confirmed) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) await loadPosts(profile.id);
  }

  async function toggleLike(postId: string) {
    if (!profile) return;
    const cur = likes[postId] || { count: 0, liked: false };
    if (cur.liked) {
      setLikes((p) => ({ ...p, [postId]: { count: Math.max(cur.count - 1, 0), liked: false } }));
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('profile_id', profile.id);
    } else {
      setLikes((p) => ({ ...p, [postId]: { count: cur.count + 1, liked: true } }));
      await supabase.from('post_likes').insert({ post_id: postId, profile_id: profile.id });
    }
  }

  async function fetchComments(postId: string) {
    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    const list = data || [];
    const ids = Array.from(new Set(list.map((c: any) => c.profile_id).filter(Boolean)));
    const profMap: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', ids);
      (profs || []).forEach((pr: any) => { profMap[pr.id] = pr; });
    }
    return list.map((c: any) => ({ ...c, profiles: profMap[c.profile_id] || null }));
  }

  async function toggleComments(postId: string) {
    if (openPost === postId) {
      setOpenPost(null);
      setCommentsList([]);
      return;
    }
    setOpenPost(postId);
    setCommentsList([]);
    setCommentsList(await fetchComments(postId));
  }

  async function addComment(postId: string) {
    if (!newComment.trim() || !profile) return;
    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      profile_id: profile.id,
      content: newComment.trim(),
    });
    if (!error) {
      setNewComment('');
      setCommentCounts((p) => ({ ...p, [postId]: (p[postId] || 0) + 1 }));
      setCommentsList(await fetchComments(postId));
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  const visiblePosts = filter === 'all' ? posts : posts.filter((p) => (p.region || 'all') === filter);

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
        <Text style={styles.headerSub}>News & Community</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.key} style={[styles.filterTab, filter === f.key && styles.filterTabActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visiblePosts}
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
                placeholder="Share news or an update..."
                placeholderTextColor="#5A6E94"
                value={newPost}
                onChangeText={setNewPost}
                multiline
              />
            </View>
            <View style={styles.regionPick}>
              {REGIONS.map((r) => (
                <TouchableOpacity key={r.key} style={[styles.regionChip, postRegion === r.key && styles.regionChipActive]} onPress={() => setPostRegion(r.key)}>
                  <Text style={[styles.regionChipText, postRegion === r.key && styles.regionChipTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.postBtn, !newPost.trim() && styles.postBtnDisabled]}
              onPress={handlePost}
              disabled={posting || !newPost.trim()}
            >
              {posting ? <ActivityIndicator color="#0A1628" size="small" /> : <Text style={styles.postBtnText}>Post</Text>}
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const lk = likes[item.id] || { count: 0, liked: false };
          const cc = commentCounts[item.id] || 0;
          return (
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
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
                  <Text style={styles.regionBadge}>{regionLabel(item.region || 'all')}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{item.content}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                  <Text style={styles.actionText}>{lk.liked ? '❤️' : '🤍'} {lk.count}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleComments(item.id)}>
                  <Text style={styles.actionText}>💬 {cc}</Text>
                </TouchableOpacity>
                {profile && item.profile_id === profile.id && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>🗑</Text>
                  </TouchableOpacity>
                )}
              </View>

              {openPost === item.id && (
                <View style={styles.commentsBox}>
                  {commentsList.map((c) => (
                    <View key={c.id} style={styles.commentRow}>
                      <View style={styles.cAvatar}>
                        {c.profiles?.avatar_url ? (
                          <Image source={{ uri: c.profiles.avatar_url }} style={styles.cAvatarImg} />
                        ) : (
                          <Text style={styles.cAvatarText}>{c.profiles?.full_name?.charAt(0) || '?'}</Text>
                        )}
                      </View>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentName}>{c.profiles?.full_name || 'Unknown'}</Text>
                        <Text style={styles.commentText}>{c.content}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.addCommentRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="اكتب تعليق..."
                      placeholderTextColor="#5A6E94"
                      value={newComment}
                      onChangeText={setNewComment}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={() => addComment(item.id)}>
                      <Text style={styles.sendBtnText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No posts in this region yet.</Text>
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
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 10 },
  logo: { fontSize: 30, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 7 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 6 },
  filterTab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A3A6B', borderWidth: 1, borderColor: '#2E5FA3' },
  filterTabActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  filterText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  filterTextActive: { color: '#0A1628' },
  composer: { backgroundColor: '#1A3A6B', margin: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2E5FA3' },
  composerTop: { flexDirection: 'row', gap: 10 },
  miniAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  miniAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#0A1628' },
  composerInput: { flex: 1, color: '#FFFFFF', fontSize: 15, minHeight: 40, maxHeight: 120, textAlignVertical: 'top' },
  regionPick: { flexDirection: 'row', gap: 8, marginTop: 10 },
  regionChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#0A1628', borderWidth: 1, borderColor: '#2E5FA3' },
  regionChipActive: { backgroundColor: '#2E5FA3', borderColor: '#C9A84C' },
  regionChipText: { color: '#8899BB', fontSize: 12, fontWeight: 'bold' },
  regionChipTextActive: { color: '#FFFFFF' },
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
  regionBadge: { fontSize: 11, color: '#C9A84C', marginTop: 3, fontWeight: 'bold' },
  postContent: { fontSize: 15, color: '#E0E6F0', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#2E5FA3', paddingTop: 10 },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#0A1628' },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  deleteText: { color: '#FF6B6B', fontSize: 13, fontWeight: 'bold' },
  commentsBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#2E5FA3', paddingTop: 12 },
  commentRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  cAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cAvatarImg: { width: 30, height: 30, borderRadius: 15 },
  cAvatarText: { fontSize: 13, fontWeight: 'bold', color: '#0A1628' },
  commentBubble: { flex: 1, backgroundColor: '#0A1628', borderRadius: 12, padding: 10 },
  commentName: { color: '#C9A84C', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  commentText: { color: '#E0E6F0', fontSize: 14, lineHeight: 19 },
  addCommentRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  commentInput: { flex: 1, backgroundColor: '#0A1628', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#2E5FA3' },
  sendBtn: { backgroundColor: '#C9A84C', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 14 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#5A6E94', fontSize: 14 },
});
