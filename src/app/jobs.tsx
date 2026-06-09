import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setJobs(data);
      setLoading(false);
    }
    loadJobs();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jobs</Text>
        <View style={{ width: 50 }} />
      </View>

      <Text style={styles.subTitle}>{jobs.length} opportunities available</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#C9A84C" style={{ marginTop: 40 }} />
      ) : (
        jobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.job_title}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{job.employment_type}</Text>
              </View>
            </View>
            <Text style={styles.jobLocation}>📍 {job.location}</Text>
            <Text style={styles.jobSalary}>💰 {job.salary_range}</Text>
            <Text style={styles.jobDesc}>{job.job_description}</Text>
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply Now</Text>
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
  jobCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2E5FA3' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', flex: 1, marginRight: 8 },
  typeBadge: { backgroundColor: '#C9A84C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeBadgeText: { color: '#0A1628', fontSize: 10, fontWeight: 'bold' },
  jobLocation: { color: '#8899BB', fontSize: 13, marginBottom: 4 },
  jobSalary: { color: '#C9A84C', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
  jobDesc: { color: '#C9D3E8', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  applyBtn: { backgroundColor: '#C9A84C', borderRadius: 10, padding: 12, alignItems: 'center' },
  applyBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 14 },
});