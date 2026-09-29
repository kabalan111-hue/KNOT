import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';

export default function QRScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const profileSlug = profile?.full_name
    ? profile.full_name.toLowerCase().replace(/\s+/g, '-')
    : 'my-identity';
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://knot.app'}/p/${profileSlug}`;

  function handleCopyLink() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
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

  function openSocial(prefix: string, value: string) {
    let url = value;
    if (prefix && !value.startsWith('http') && !value.startsWith('mailto:')) {
      url = prefix + value.replace('@', '');
    }
    Linking.openURL(url).catch(() => {});
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerSub}>My Digital Identity</Text>
      </View>

      <View style={styles.profileMini}>
        <View style={styles.avatar}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{profile?.full_name ? profile.full_name.charAt(0) : 'K'}</Text>
          )}
        </View>
        <View>
          <Text style={styles.name}>{profile?.full_name || ''}</Text>
          <Text style={styles.title}>{profile?.title || ''}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      </View>

      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Scan to View My Identity</Text>
        <Text style={styles.qrSub}>Point any camera to connect instantly</Text>
        <View style={styles.qrContainer} nativeID="qr-code">
          <QRCode
            value={profileUrl}
            size={180}
            color="#0A1628"
            backgroundColor="#FFFFFF"
          />
        </View>
        <View style={styles.urlBox}>
          <Text style={styles.urlText}>{profileUrl.replace('https://', '').replace('http://', '')}</Text>
        </View>
      </View>

      <View style={styles.shareGrid}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleCopyLink}>
          <Text style={styles.shareIcon}>🔗</Text>
          <Text style={styles.shareBtnText}>{copied ? 'Copied!' : 'Copy Link'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>💾</Text>
          <Text style={styles.shareBtnText}>Save QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>📡</Text>
          <Text style={styles.shareBtnText}>NFC Tap</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>My Links</Text>
      <View style={styles.socialCard}>
        {socials.filter(s => profile?.[s.key] && String(profile[s.key]).trim() !== '').length === 0 ? (
          <Text style={styles.emptyText}>No links added yet. Add them from Edit Profile.</Text>
        ) : (
          socials.filter(s => profile?.[s.key] && String(profile[s.key]).trim() !== '').map((s) => (
            <TouchableOpacity key={s.key} style={styles.socialRow} onPress={() => openSocial(s.prefix, profile[s.key])}>
              <Text style={styles.socialIcon}>{s.icon}</Text>
              <Text style={styles.socialLabel}>{s.label}</Text>
              <Text style={styles.socialArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {profile?.cv_url ? (
        <TouchableOpacity style={styles.cvBtn} onPress={() => Linking.openURL(profile.cv_url).catch(() => {})}>
          <Text style={styles.cvBtnText}>📄 View / Download CV</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.profile_views ?? 0}</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{profile?.connections ?? 0}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>28</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 16 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 8 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4 },
  profileMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', margin: 20, marginBottom: 0, borderRadius: 14, padding: 14, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 46, height: 46, borderRadius: 23 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#0A1628' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  title: { fontSize: 12, color: '#8899BB', marginTop: 2 },
  badge: { marginLeft: 'auto', backgroundColor: '#10B981', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  qrCard: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  qrTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  qrSub: { fontSize: 12, color: '#8899BB', marginBottom: 20 },
  qrContainer: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16 },
  urlBox: { backgroundColor: '#0A1628', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2E5FA3' },
  urlText: { color: '#C9A84C', fontSize: 13, fontWeight: 'bold' },
  shareGrid: { flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 20 },
  shareBtn: { flex: 1, backgroundColor: '#1A3A6B', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2E5FA3' },
  shareIcon: { fontSize: 22, marginBottom: 4 },
  shareBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 12 },
  socialCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2E5FA3', overflow: 'hidden' },
  socialRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2E5FA3', gap: 14 },
  socialIcon: { fontSize: 22 },
  socialLabel: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  socialArrow: { color: '#C9A84C', fontSize: 22, fontWeight: 'bold' },
  emptyText: { color: '#8899BB', fontSize: 13, padding: 16, textAlign: 'center' },
  cvBtn: { backgroundColor: '#C9A84C', marginHorizontal: 20, marginTop: 16, borderRadius: 12, padding: 14, alignItems: 'center' },
  cvBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A3A6B', margin: 20, borderRadius: 14, padding: 16, justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C' },
  statLabel: { fontSize: 11, color: '#8899BB', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2E5FA3' },
});
