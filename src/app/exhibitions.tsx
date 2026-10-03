import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';

export default function ExhibitionsScreen() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (prof) setProfile(prof);
      }
      const { data } = await supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: true });
      if (data) setExhibitions(data);
      setLoading(false);
    }
    load();
  }, []);

  const slug = profile?.slug
    || (profile?.full_name ? profile.full_name.toLowerCase().replace(/\s+/g, '-') : 'my-identity');
  const profileUrl = `https://iknot.app/p/${slug}`;

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerTitle}>Exhibitions</Text>
      </View>

      {/* My entry pass (QR first) */}
      <View style={styles.passCard}>
        <Text style={styles.passTitle}>🎟️ بطاقة دخولي</Text>
        <Text style={styles.passSub}>أظهر هذا الكود عند الدخول ليتم تسجيلك</Text>
        <View style={styles.qrBox}>
          <QRCode value={profileUrl} size={150} color="#0A1628" backgroundColor="#FFFFFF" />
        </View>
        <Text style={styles.passName}>{profile?.full_name || ''}</Text>
      </View>

      {/* Organizer scanner */}
      {profile?.is_organizer && (
        <TouchableOpacity style={styles.scannerBtn} onPress={() => router.push('/scan')}>
          <Text style={styles.scannerBtnText}>📷  ماسح دخول المعرض (للمنظّمين)</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>المعارض القادمة</Text>
      <Text style={styles.subTitle}>{exhibitions.length} فعالية</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#C9A84C" style={{ marginTop: 20 }} />
      ) : (
        exhibitions.map((ex) => (
          <View key={ex.id} style={styles.exCard}>
            <View style={styles.exHeader}>
              <Text style={styles.exTitle}>{ex.title}</Text>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{ex.category}</Text>
              </View>
            </View>
            <Text style={styles.exDate}>📅 {formatDate(ex.start_date)} - {formatDate(ex.end_date)}</Text>
            <Text style={styles.exLocation}>📍 {ex.location}</Text>
            <Text style={styles.exDesc}>{ex.description}</Text>
            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 10 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 6 },
  headerTitle: { color: '#8899BB', fontSize: 13, marginTop: 4 },
  passCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, marginTop: 8, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  passTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  passSub: { color: '#8899BB', fontSize: 12, marginBottom: 16, textAlign: 'center' },
  qrBox: { padding: 12, backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12 },
  passName: { color: '#C9A84C', fontSize: 15, fontWeight: 'bold' },
  scannerBtn: { backgroundColor: '#1A3A6B', marginHorizontal: 20, marginTop: 14, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  scannerBtnText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginTop: 24, textAlign: 'right' },
  subTitle: { color: '#8899BB', fontSize: 13, paddingHorizontal: 20, marginBottom: 14, textAlign: 'right' },
  exCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2E5FA3' },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  exTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', flex: 1, marginRight: 8 },
  catBadge: { backgroundColor: '#C9A84C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  catBadgeText: { color: '#0A1628', fontSize: 10, fontWeight: 'bold' },
  exDate: { color: '#C9A84C', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  exLocation: { color: '#8899BB', fontSize: 13, marginBottom: 10 },
  exDesc: { color: '#C9D3E8', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  detailsBtn: { backgroundColor: '#C9A84C', borderRadius: 10, padding: 12, alignItems: 'center' },
  detailsBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 14 },
});
