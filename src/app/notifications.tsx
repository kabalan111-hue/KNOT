import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function NotificationsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);
      setJobs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  function timeAgo(dateStr: string) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `قبل ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `قبل ${hrs} ساعة`;
    const days = Math.floor(hrs / 24);
    return `قبل ${days} يوم`;
  }

  function isRecent(dateStr: string) {
    if (!dateStr) return false;
    return Date.now() - new Date(dateStr).getTime() < 3 * 24 * 60 * 60 * 1000;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.iconBtn}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
      </View>

      <ScrollView style={styles.list}>
        <Text style={styles.sectionTitle}>Jobs & Opportunities</Text>

        {loading && <ActivityIndicator color="#C9A84C" style={{ marginTop: 20 }} />}

        {!loading && jobs.length === 0 && (
          <Text style={styles.empty}>لا يوجد وظائف جديدة حالياً</Text>
        )}

        {!loading &&
          jobs.map((job) => {
            const recent = isRecent(job.created_at);
            return (
              <TouchableOpacity
                key={job.id}
                style={[styles.notifItem, recent && styles.notifUnread]}
                onPress={() => router.push('/jobs')}
              >
                <View style={[styles.notifIcon, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.notifIconText}>💼</Text>
                </View>
                <View style={styles.notifInfo}>
                  <Text style={styles.notifTitle}>
                    {recent ? '🆕 ' : ''}وظيفة جديدة: {job.job_title}
                  </Text>
                  <Text style={styles.notifBody}>
                    {[job.location ? `📍 ${job.location}` : '', job.employment_type || '', job.salary_range ? `💰 ${job.salary_range}` : '']
                      .filter(Boolean)
                      .join('  ·  ')}
                  </Text>
                  <Text style={styles.notifTime}>{timeAgo(job.created_at)}</Text>
                </View>
                {recent && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  iconBtn: { backgroundColor: '#1A3A6B', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16 },
  list: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#C9A84C', paddingHorizontal: 20, paddingVertical: 10 },
  empty: { color: '#5A6E94', fontSize: 14, textAlign: 'center', paddingVertical: 30 },
  notifItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A3A6B', alignItems: 'flex-start' },
  notifUnread: { backgroundColor: '#0D1E35' },
  notifIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifIconText: { fontSize: 20 },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  notifBody: { fontSize: 13, color: '#8899BB', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#C9A84C' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C9A84C', marginTop: 4, marginLeft: 8 },
});
