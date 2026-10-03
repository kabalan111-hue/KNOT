import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';

export default function MyIdScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function loadFor(userId: string) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    }
    async function load() {
      // getSession is reliable on cold start (reads stored session); getUser can be null early
      let { data: { session } } = await supabase.auth.getSession();
      let user = session?.user ?? null;
      if (!user) {
        const res = await supabase.auth.getUser();
        user = res.data.user ?? null;
      }
      if (!user) {
        router.replace('/login');
        return;
      }
      loadFor(user.id);
    }
    load();
    // if the session restores a moment later (cold start), load the profile then
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadFor(session.user.id);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  }

  const slug = profile?.slug
    || (profile?.full_name ? profile.full_name.toLowerCase().replace(/\s+/g, '-') : 'my-identity');
  const profileUrl = `https://iknot.app/p/${slug}`;

  function copyLink() {
    if (typeof navigator !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      showToast('تم نسخ الرابط 🔗');
    } else {
      Share.share({ message: profileUrl }).catch(() => {});
    }
  }
  function shareWhatsApp() {
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(profileUrl)}`).catch(() => {});
  }
  function shareEmail() {
    Linking.openURL(`mailto:?subject=${encodeURIComponent('My KNOT Identity')}&body=${encodeURIComponent(profileUrl)}`).catch(() => {});
  }
  function shareMore() {
    Share.share({ message: `${profile?.full_name || ''} — KNOT\n${profileUrl}` }).catch(() => {});
  }

  const socials = [
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', prefix: 'https://linkedin.com/in/' },
    { key: 'instagram', label: 'Instagram', icon: '📷', prefix: 'https://instagram.com/' },
    { key: 'facebook', label: 'Facebook', icon: '👥', prefix: 'https://facebook.com/' },
    { key: 'twitter', label: 'X (Twitter)', icon: '🐦', prefix: 'https://twitter.com/' },
    { key: 'whatsapp', label: 'WhatsApp', icon: '💚', prefix: 'https://wa.me/' },
    { key: 'website', label: 'Website', icon: '🌐', prefix: '' },
    { key: 'contact_email', label: 'Email', icon: '✉️', prefix: 'mailto:' },
  ];
  const hiddenFields: string[] = profile?.hidden_fields || [];
  function openSocial(prefix: string, value: string) {
    let url = value;
    if (prefix && !value.startsWith('http') && !value.startsWith('mailto:')) {
      url = prefix + value.replace('@', '');
    }
    Linking.openURL(url).catch(() => {});
  }
  const visibleSocials = socials.filter(s => profile?.[s.key] && String(profile[s.key]).trim() !== '' && !hiddenFields.includes(s.key));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/chat')}>
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
        <Text style={styles.name}>{profile?.full_name || ''}</Text>
        <Text style={styles.title}>{profile?.title || ''}</Text>
        <Text style={styles.company}>{profile?.company ? `${profile.company} • ` : ''}Doha, Qatar</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>✓ Verified</Text></View>

        <View style={styles.qrBox}>
          <QRCode value={profileUrl} size={170} color="#0A1628" backgroundColor="#FFFFFF" />
        </View>
        <View style={styles.urlBox}>
          <Text style={styles.urlText}>{profileUrl.replace('https://', '')}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={() => setShowShare(!showShare)}>
          <Text style={styles.shareBtnText}>📤  Share My ID</Text>
        </TouchableOpacity>

        {showShare && (
          <View style={styles.shareRow}>
            <TouchableOpacity style={styles.shareOpt} onPress={copyLink}>
              <Text style={styles.shareOptIcon}>🔗</Text><Text style={styles.shareOptLabel}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOpt} onPress={shareWhatsApp}>
              <Text style={styles.shareOptIcon}>💚</Text><Text style={styles.shareOptLabel}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOpt} onPress={shareEmail}>
              <Text style={styles.shareOptIcon}>✉️</Text><Text style={styles.shareOptLabel}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOpt} onPress={() => showToast('NFC Tap قريباً 📡')}>
              <Text style={styles.shareOptIcon}>📡</Text><Text style={styles.shareOptLabel}>NFC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareOpt} onPress={shareMore}>
              <Text style={styles.shareOptIcon}>⋯</Text><Text style={styles.shareOptLabel}>More</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>{profile?.profile_views ?? 0}</Text><Text style={styles.statLabel}>Scans</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statNum}>{profile?.connections ?? 0}</Text><Text style={styles.statLabel}>Connections</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Text style={styles.statNum}>{profile?.posts ?? 0}</Text><Text style={styles.statLabel}>Posts</Text></View>
      </View>

      <Text style={styles.sectionTitle}>My Links</Text>
      <View style={styles.linksCard}>
        {visibleSocials.length === 0 ? (
          <Text style={styles.emptyText}>No links yet. Add them from Edit Profile.</Text>
        ) : (
          visibleSocials.map((s) => (
            <TouchableOpacity key={s.key} style={styles.linkRow} onPress={() => openSocial(s.prefix, profile[s.key])}>
              <Text style={styles.linkIcon}>{s.icon}</Text>
              <Text style={styles.linkLabel}>{s.label}</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {profile?.cv_url && !hiddenFields.includes('cv') ? (
        <TouchableOpacity style={styles.cvBtn} onPress={() => Linking.openURL(profile.cv_url).catch(() => {})}>
          <Text style={styles.cvBtnText}>📄 View / Download CV</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/jobs')}>
          <Text style={styles.quickIcon}>💼</Text><Text style={styles.quickText}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/company')}>
          <Text style={styles.quickIcon}>🏢</Text><Text style={styles.quickText}>My Company</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/verify')}>
          <Text style={styles.quickIcon}>✓</Text><Text style={styles.quickText}>Verify</Text>
        </TouchableOpacity>
      </View>

      {profile?.is_organizer && (
        <>
          <Text style={styles.sectionTitle}>🎪 Organizer Tools</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.organizerBtn} onPress={() => router.push('/scan')}>
              <Text style={styles.quickIcon}>📷</Text><Text style={styles.quickText}>Scanner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.organizerBtn} onPress={() => router.push('/reports')}>
              <Text style={styles.quickIcon}>📊</Text><Text style={styles.quickText}>Reports</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={{ height: 30 }} />

      {toast ? (
        <View style={styles.toastWrap} pointerEvents="none"><Text style={styles.toastText}>{toast}</Text></View>
      ) : null}
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
  badge: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 18 },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  qrBox: { padding: 14, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12 },
  urlBox: { backgroundColor: '#0A1628', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#2E5FA3', marginBottom: 16 },
  urlText: { color: '#C9A84C', fontSize: 12, fontWeight: 'bold' },
  shareBtn: { backgroundColor: '#C9A84C', paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center' },
  shareBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 15 },
  shareRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 12, backgroundColor: '#0A1628', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4, borderWidth: 1, borderColor: '#2E5FA3' },
  shareOpt: { alignItems: 'center', flex: 1 },
  shareOptIcon: { fontSize: 20 },
  shareOptLabel: { color: '#8899BB', fontSize: 9, marginTop: 3, fontWeight: 'bold' },
  editBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9A84C', paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  editBtnText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 20, borderRadius: 14, padding: 16, justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C' },
  statLabel: { fontSize: 11, color: '#8899BB', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2E5FA3' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 12 },
  linksCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2E5FA3', overflow: 'hidden', marginBottom: 16 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2E5FA3', gap: 14 },
  linkIcon: { fontSize: 22 },
  linkLabel: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  linkArrow: { color: '#C9A84C', fontSize: 22, fontWeight: 'bold' },
  emptyText: { color: '#8899BB', fontSize: 13, padding: 16, textAlign: 'center' },
  cvBtn: { backgroundColor: '#C9A84C', marginHorizontal: 20, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4 },
  cvBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 15 },
  quickActions: { flexDirection: 'row', marginHorizontal: 20, marginTop: 4, marginBottom: 16, gap: 10 },
  quickBtn: { flex: 1, backgroundColor: '#1A3A6B', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2E5FA3' },
  organizerBtn: { flex: 1, backgroundColor: '#1A3A6B', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  quickIcon: { fontSize: 26, marginBottom: 6 },
  quickText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  toastWrap: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: '#C9A84C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, left: 60, right: 60 },
  toastText: { color: '#0A1628', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
});
