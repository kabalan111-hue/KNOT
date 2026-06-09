import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ExhibitionsScreen() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExhibitions() {
      const { data } = await supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: true });
      if (data) setExhibitions(data);
      setLoading(false);
    }
    loadExhibitions();
  }, []);

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exhibitions</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.subTitle}>{exhibitions.length} upcoming events</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#C9A84C" style={{ marginTop: 40 }} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  backText: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold', width: 50 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  subTitle: { color: '#8899BB', fontSize: 13, paddingHorizontal: 20, marginBottom: 16 },
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