import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      if (data) {
        setProfileId(data.id);
        setFullName(data.full_name || '');
        setTitle(data.title || '');
        setCompany(data.company || '');
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, title: title, company: company })
      .eq('id', profileId);
    setSaving(false);
    if (error) {
      setMessage('Error: could not save');
    } else {
      setMessage('Saved successfully');
      setTimeout(() => router.back(), 800);
    }
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.form}>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
          placeholderTextColor="#8899BB"
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#8899BB"
        />

        <Text style={styles.label}>Company</Text>
        <TextInput
          style={styles.input}
          value={company}
          onChangeText={setCompany}
          placeholder="Company"
          placeholderTextColor="#8899BB"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backText: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold', width: 50 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  form: { paddingHorizontal: 20 },
  label: { color: '#8899BB', fontSize: 13, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#1A3A6B', borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2E5FA3' },
  saveBtn: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#10B981', fontSize: 14, textAlign: 'center', marginTop: 16, fontWeight: 'bold' },
});