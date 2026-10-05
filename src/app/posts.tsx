import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

// Countries — users pick the country their post belongs to
const COUNTRIES = [
  { key: 'all', label: 'عام', flag: '📢' },
  { key: 'qa', label: 'قطر', flag: '🇶🇦' },
  { key: 'ae', label: 'الإمارات', flag: '🇦🇪' },
  { key: 'sa', label: 'السعودية', flag: '🇸🇦' },
  { key: 'kw', label: 'الكويت', flag: '🇰🇼' },
  { key: 'bh', label: 'البحرين', flag: '🇧🇭' },
  { key: 'om', label: 'عُمان', flag: '🇴🇲' },
  { key: 'eg', label: 'مصر', flag: '🇪🇬' },
  { key: 'sy', label: 'سوريا', flag: '🇸🇾' },
  { key: 'lb', label: 'لبنان', flag: '🇱🇧' },
  { key: 'jo', label: 'الأردن', flag: '🇯🇴' },
  { key: 'tr', label: 'تركيا', flag: '🇹🇷' },
  { key: 'ye', label: 'اليمن', flag: '🇾🇪' },
  { key: 'iq', label: 'العراق', flag: '🇮🇶' },
];
const LEGACY: Record<string, string> = { qatar: 'qa', gcc: 'all' };
function norm(r?: string) { return LEGACY[r || ''] || r || 'all'; }
function regionLabel(r?: string) {
  const k = norm(r);
  const c = COUNTRIES.find((x) => x.key === k);
  return c ? `${c.flag} ${c.label}` : '📢 عام';
}

export default function PostsScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postRegion, setPostRegion] = useState('all');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => { loadEverything(); }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  }

  async function loadEverything() {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? (await supabase.auth.getUser()).data.user;
    if (!user) { router.replace('/login'); return; }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(prof);
    await loadPosts(prof?.id);
    setLoading(false);
  }

  async function loadPosts(myId: string) {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50);
    const list = data || [];
    const authorIds = Array.from(new Set(list.map((p: any) => p.profile_id).filter(Boolean)));
    const profMap: Record<string, any> = {};
    if (authorIds.length) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, title, avatar_url').in('id', authorIds);
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

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { showToast('نحتاج إذن الصور 📷'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true });
    if (!res.canceled && res.assets?.[0]?.uri) setImageUri(res.assets[0].uri);
  }

  async function uploadImage(uri: string): Promise<string | null> {
    try {
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const path = `${profile.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('post-media').upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: true });
      if (error) return null;
      const { data } = supabase.storage.from('post-media').getPublicUrl(path);
      return data.publicUrl;
    } catch { return null; }
  }

  async function handlePost() {
    if ((!newPost.trim() && !imageUri) || !profile) return;
    setPosting(true);
    let uploadedUrl: string | null = null;
    if (imageUri) uploadedUrl = await uploadImage(imageUri);
    const payload: any = { profile_id: profile.id, content: newPost.trim(), region: postRegion };
    if (uploadedUrl) payload.image_url = uploadedUrl;
    const { error } = await supabase.from('posts').insert(payload);
    setPosting(false);
    if (!error) {
      setNewPost(''); setPostRegion('all'); setImageUri(null);
      showToast('تم النشر ✅');
      await loadPosts(profile.id);
    } else { showToast('تعذّر النشر، حاول مرة أخرى'); }
  }

  async function repost(item: any) {
    if (!profile) return;
    const content = `🔁 أعاد نشر منشور ${item.profiles?.full_name || ''}:\n\n${item.content || ''}`.trim();
    const payload: any = { profile_id: profile.id, content, region: item.region || 'all' };
    if (item.image_url) payload.image_url = item.image_url;
    const { error } = await supabase.from('posts').insert(payload);
    if (!error) { showToast('تمت إعادة النشر 🔁'); await loadPosts(profile.id); }
  }

  async function sharePost(item: any) {
    try { await Share.share({ message: `${item.content || ''}\n\n— عبر KNOT\nhttps://iknot.app` }); } catch {}
  }
  function toggleSave(postId: string) {
    const willSave = !saved[postId];
    setSaved((p) => ({ ...p, [postId]: willSave }));
    showToast(willSave ? 'حُفظ 🔖' : 'أُزيل من المحفوظات');
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
    const { data } = await supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
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
    if (openPost === postId) { setOpenPost(null); setCommentsList([]); return; }
    setOpenPost(postId); setCommentsList([]);
    setCommentsList(await fetchComments(postId));
  }
  async function addComment(postId: string) {
    if (!newComment.trim() || !profile) return;
    const { error } = await supabase.from('post_comments').insert({ post_id: postId, profile_id: profile.id, content: newComment.trim() });
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

  const visiblePosts = filter === 'all' ? posts : posts.filter((p) => norm(p.region) === filter);

  if (loading) {
    return (<View style={styles.loadingWrap}><ActivityIndicator color="#C9A84C" size="large" /></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerSub}>News & Community</Text>
      </View>

      {/* Country filter — horizontal scroll */}
      <View style={{ maxHeight: 48 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {COUNTRIES.map((f) => (
            <TouchableOpacity key={f.key} style={[styles.filterTab, filter === f.key && styles.filterTabActive]} onPress={() => setFilter(f.key)}>
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.flag} {f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.composer}>
            <View style={styles.composerTop}>
              <View style={styles.miniAvatar}>
                {profile?.avatar_url ? (<Image source={{ uri: profile.avatar_url }} style={styles.miniAvatarImg} />) : (<Text style={styles.miniAvatarText}>{profile?.full_name?.charAt(0) || 'K'}</Text>)}
              </View>
              <TextInput style={styles.composerInput} placeholder="شاركنا خبر أو تحديث..." placeholderTextColor="#7E93B8" value={newPost} onChangeText={setNewPost} multiline />
            </View>

            {imageUri && (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.previewRemove} onPress={() => setImageUri(null)}><Text style={styles.previewRemoveText}>✕</Text></TouchableOpacity>
              </View>
            )}

            <View style={styles.toolbar}>
              <TouchableOpacity style={styles.toolBtn} onPress={pickImage}><Text style={styles.toolIcon}>📷</Text><Text style={styles.toolLabel}>صورة</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => showToast('رفع الفيديو قريباً 🎥')}><Text style={styles.toolIcon}>🎥</Text><Text style={styles.toolLabel}>فيديو</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => showToast('الاستطلاعات قريباً 📊')}><Text style={styles.toolIcon}>📊</Text><Text style={styles.toolLabel}>استطلاع</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => showToast('المشاعر قريباً 😊')}><Text style={styles.toolIcon}>😊</Text><Text style={styles.toolLabel}>شعور</Text></TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn} onPress={() => showToast('الموقع قريباً 📍')}><Text style={styles.toolIcon}>📍</Text><Text style={styles.toolLabel}>موقع</Text></TouchableOpacity>
            </View>

            <Text style={styles.pickLabel}>اختر البلد:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionPick}>
              {COUNTRIES.map((r) => (
                <TouchableOpacity key={r.key} style={[styles.regionChip, postRegion === r.key && styles.regionChipActive]} onPress={() => setPostRegion(r.key)}>
                  <Text style={[styles.regionChipText, postRegion === r.key && styles.regionChipTextActive]}>{r.flag} {r.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[styles.postBtn, (!newPost.trim() && !imageUri) && styles.postBtnDisabled]} onPress={handlePost} disabled={posting || (!newPost.trim() && !imageUri)}>
              {posting ? <ActivityIndicator color="#0F2140" size="small" /> : <Text style={styles.postBtnText}>نشر</Text>}
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const lk = likes[item.id] || { count: 0, liked: false };
          const cc = commentCounts[item.id] || 0;
          const isSaved = !!saved[item.id];
          return (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  {item.profiles?.avatar_url ? (<Image source={{ uri: item.profiles.avatar_url }} style={styles.avatarImg} />) : (<Text style={styles.avatarText}>{item.profiles?.full_name?.charAt(0) || '?'}</Text>)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postName}>{item.profiles?.full_name || 'Unknown'}</Text>
                  <Text style={styles.postTitle}>{item.profiles?.title || ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.postTime}>{timeAgo(item.created_at)}</Text>
                  <Text style={styles.regionBadge}>{regionLabel(item.region)}</Text>
                </View>
              </View>

              {!!item.content && <Text style={styles.postContent}>{item.content}</Text>}
              {item.image_url ? (<Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />) : null}

              <View style={styles.statsBar}>
                <Text style={styles.statsText}>{lk.count > 0 ? `❤️ ${lk.count}` : ' '}</Text>
                <Text style={styles.statsText}>{cc > 0 ? `${cc} تعليق` : ' '}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}><Text style={styles.actionIcon}>{lk.liked ? '❤️' : '🤍'}</Text><Text style={[styles.actionLabel, lk.liked && styles.actionLabelActive]}>أعجبني</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleComments(item.id)}><Text style={styles.actionIcon}>💬</Text><Text style={styles.actionLabel}>تعليق</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => repost(item)}><Text style={styles.actionIcon}>🔁</Text><Text style={styles.actionLabel}>إعادة</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => sharePost(item)}><Text style={styles.actionIcon}>📤</Text><Text style={styles.actionLabel}>مشاركة</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleSave(item.id)}><Text style={styles.actionIcon}>{isSaved ? '🔖' : '📑'}</Text><Text style={[styles.actionLabel, isSaved && styles.actionLabelActive]}>حفظ</Text></TouchableOpacity>
                {profile && item.profile_id === profile.id && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}><Text style={styles.actionIcon}>🗑</Text></TouchableOpacity>
                )}
              </View>

              {openPost === item.id && (
                <View style={styles.commentsBox}>
                  {commentsList.map((c) => (
                    <View key={c.id} style={styles.commentRow}>
                      <View style={styles.cAvatar}>
                        {c.profiles?.avatar_url ? (<Image source={{ uri: c.profiles.avatar_url }} style={styles.cAvatarImg} />) : (<Text style={styles.cAvatarText}>{c.profiles?.full_name?.charAt(0) || '?'}</Text>)}
                      </View>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentName}>{c.profiles?.full_name || 'Unknown'}</Text>
                        <Text style={styles.commentText}>{c.content}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.addCommentRow}>
                    <TextInput style={styles.commentInput} placeholder="اكتب تعليق..." placeholderTextColor="#7E93B8" value={newComment} onChangeText={setNewComment} />
                    <TouchableOpacity style={styles.sendBtn} onPress={() => addComment(item.id)}><Text style={styles.sendBtnText}>إرسال</Text></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>لا يوجد منشورات في هذه المنطقة بعد.</Text></View>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {toast ? (<View style={styles.toastWrap} pointerEvents="none"><Text style={styles.toastText}>{toast}</Text></View>) : null}
    </View>
  );
}

const BG = '#0F2140';
const CARD = '#284F86';
const INNER = '#193763';
const BORDER = '#3C68AA';
const GOLD = '#C9A84C';
const MUTE = '#9BB0D0';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  loadingWrap: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 10 },
  logo: { fontSize: 30, fontWeight: 'bold', color: GOLD, letterSpacing: 7 },
  headerSub: { fontSize: 12, color: MUTE, marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  filterTab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  filterTabActive: { backgroundColor: GOLD, borderColor: GOLD },
  filterText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  filterTextActive: { color: '#0F2140' },
  composer: { backgroundColor: CARD, margin: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: BORDER },
  composerTop: { flexDirection: 'row', gap: 10 },
  miniAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  miniAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#0F2140' },
  composerInput: { flex: 1, color: '#FFFFFF', fontSize: 15, minHeight: 40, maxHeight: 120, textAlignVertical: 'top', textAlign: 'right' },
  previewWrap: { marginTop: 12, position: 'relative' },
  previewImg: { width: '100%', height: 180, borderRadius: 12 },
  previewRemove: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(15,33,64,0.85)', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  previewRemoveText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, backgroundColor: INNER, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 4, borderWidth: 1, borderColor: BORDER },
  toolBtn: { alignItems: 'center', flex: 1, paddingVertical: 2 },
  toolIcon: { fontSize: 20 },
  toolLabel: { color: MUTE, fontSize: 10, marginTop: 2, fontWeight: 'bold' },
  pickLabel: { color: MUTE, fontSize: 12, marginTop: 12, marginBottom: 6, textAlign: 'right', fontWeight: 'bold' },
  regionPick: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  regionChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: INNER, borderWidth: 1, borderColor: BORDER },
  regionChipActive: { backgroundColor: BORDER, borderColor: GOLD },
  regionChipText: { color: MUTE, fontSize: 12, fontWeight: 'bold' },
  regionChipTextActive: { color: '#FFFFFF' },
  postBtn: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#0F2140', fontWeight: 'bold', fontSize: 15 },
  postCard: { backgroundColor: CARD, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#0F2140' },
  postName: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  postTitle: { fontSize: 12, color: MUTE, marginTop: 1 },
  postTime: { fontSize: 12, color: MUTE },
  regionBadge: { fontSize: 11, color: GOLD, marginTop: 3, fontWeight: 'bold' },
  postContent: { fontSize: 15, color: '#EAF0F8', lineHeight: 22 },
  postImage: { width: '100%', height: 220, borderRadius: 12, marginTop: 12, backgroundColor: INNER },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  statsText: { color: MUTE, fontSize: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  actionBtn: { alignItems: 'center', flex: 1, paddingVertical: 4 },
  actionIcon: { fontSize: 18 },
  actionLabel: { color: MUTE, fontSize: 10, marginTop: 2, fontWeight: 'bold' },
  actionLabelActive: { color: GOLD },
  commentsBox: { marginTop: 12, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 12 },
  commentRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  cAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cAvatarImg: { width: 30, height: 30, borderRadius: 15 },
  cAvatarText: { fontSize: 13, fontWeight: 'bold', color: '#0F2140' },
  commentBubble: { flex: 1, backgroundColor: INNER, borderRadius: 12, padding: 10 },
  commentName: { color: GOLD, fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  commentText: { color: '#EAF0F8', fontSize: 14, lineHeight: 19 },
  addCommentRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  commentInput: { flex: 1, backgroundColor: INNER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: BORDER, textAlign: 'right' },
  sendBtn: { backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnText: { color: '#0F2140', fontWeight: 'bold', fontSize: 14 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: MUTE, fontSize: 14 },
  toastWrap: { position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: GOLD, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, left: 60, right: 60 },
  toastText: { color: '#0F2140', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
});
