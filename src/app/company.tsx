import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const socials = [
  { key: 'website', label: 'Website', icon: '🌐', prefix: '' },
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', prefix: 'https://linkedin.com/company/' },
  { key: 'instagram', label: 'Instagram', icon: '📷', prefix: 'https://instagram.com/' },
  { key: 'facebook', label: 'Facebook', icon: '👥', prefix: 'https://facebook.com/' },
  { key: 'twitter', label: 'X (Twitter)', icon: '🐦', prefix: 'https://twitter.com/' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💚', prefix: 'https://wa.me/' },
  { key: 'contact_email', label: 'Email', icon: '✉️', prefix: 'mailto:' },
];

export default function CompanyScreen() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const { data } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle();
    setCompany(data || null);
    setLoading(false);
  }

  function openSocial(prefix: string, value: string) {
    let url = value;
    if (prefix && !value.startsWith('http') && !value.startsWith('mailto:')) {
      url = prefix + value.replace('@', '');
    }
    Linking.openURL(url).catch(() => {});
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  if (!company) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.emptyWrap}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🏢</Text>
          <Text style={styles.emptyTitle}>No company yet</Text>
          <Text style={styles.emptySub}>أنشئ الهوية الرقمية لشركتك: الشعار، المواقع، والكتالوجات.</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/edit-company')}>
            <Text style={styles.createBtnText}>+ Create Company ID</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const activeLinks = socials.filter((s) => company[s.key] && String(company[s.key]).trim() !== '');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.logo}>
          {company.logo_url ? (
            <Image source={{ uri: company.logo_url }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoText}>{company.name ? company.name.charAt(0) : '🏢'}</Text>
          )}
        </View>
        <Text style={styles.name}>{company.name}</Text>
        {company.description ? <Text style={styles.description}>{company.description}</Text> : null}

        <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-company')}>
          <Text style={styles.editBtnText}>✏️ Edit Company</Text>
        </TouchableOpacity>
      </View>

      {company.catalog_url ? (
        <TouchableOpacity style={styles.catalogBtn} onPress={() => Linking.openURL(company.catalog_url).catch(() => {})}>
          <Text style={styles.catalogBtnText}>📚 View Catalog (PDF)</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.sectionTitle}>Company Links</Text>
      <View style={styles.socialCard}>
        {activeLinks.length === 0 ? (
          <Text style={styles.emptyText}>No links added yet. Add them from Edit Company.</Text>
        ) : (
          activeLinks.map((s) => (
            <TouchableOpacity key={s.key} style={styles.socialRow} onPress={() => openSocial(s.prefix, company[s.key])}>
              <Text style={styles.socialIcon}>{s.icon}</Text>
              <Text style={styles.socialLabel}>{s.label}</Text>
              <Text style={styles.socialArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  centered: { flex: 1, backgroundColor: '#0A1628', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 10 },
  backText: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold', width: 50 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptyWrap: { flexGrow: 1 },
  emptyCard: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#2E5FA3', marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { color: '#8899BB', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  createBtn: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
  createBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 16 },
  profileCard: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  logo: { width: 90, height: 90, borderRadius: 18, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  logoImage: { width: 90, height: 90, borderRadius: 18 },
  logoText: { fontSize: 36, fontWeight: 'bold', color: '#0A1628' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6, textAlign: 'center' },
  description: { fontSize: 14, color: '#C9D3E8', textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  editBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9A84C', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 6 },
  editBtnText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 15 },
  catalogBtn: { backgroundColor: '#C9A84C', marginHorizontal: 20, marginBottom: 10, borderRadius: 12, padding: 14, alignItems: 'center' },
  catalogBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', paddingHorizontal: 20, marginBottom: 12, marginTop: 10 },
  socialCard: { backgroundColor: '#1A3A6B', marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2E5FA3', overflow: 'hidden' },
  socialRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2E5FA3', gap: 14 },
  socialIcon: { fontSize: 22 },
  socialLabel: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  socialArrow: { color: '#C9A84C', fontSize: 22, fontWeight: 'bold' },
  emptyText: { color: '#8899BB', fontSize: 13, padding: 16, textAlign: 'center' },
});
