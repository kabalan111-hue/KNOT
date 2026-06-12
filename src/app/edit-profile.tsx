import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

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
      if (data) {
        setProfileId(data.id);
        setFullName(data.full_name || '');
        setTitle(data.title || '');
        setCompany(data.company || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
      }
    }
    loadProfile();
  }, []);

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    setUploading(true);
    setMessage('');
    try {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const fileExt = (asset.fileName?.split('.').pop() || asset.uri.split('.').pop()?.split('?')[0] || 'jpg').toLowerCase();
      const contentType = blob.type || `image/${fileExt}`;
      const fileName = `${profileId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: contentType,
          upsert: true,
        });

      if (uploadError) {
        setMessage('Error: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(urlData.publicUrl);
      setMessage('Photo uploaded');
    } catch (e: any) {
      setMessage('Error: ' + (e?.message || 'could not upload image'));
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!profileId) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, title: title, company: company, phone: phone, avatar_url: avatarUrl })
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

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{fullName ? fullName.charAt(0) : 'K'}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickImage} disabled={uploading}>
          <Text style={styles.changePhotoText}>{uploading ? 'Uploading...' : '📷 Change Photo'}</Text>
        </TouchableOpacity>
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

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor="#8899BB"
          keyboardType="phone-pad"
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
  avatarSection: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#0A1628' },
  changePhotoBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9A84C', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  changePhotoText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 14 },
  form: { paddingHorizontal: 20 },
  label: { color: '#8899BB', fontSize: 13, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#1A3A6B', borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2E5FA3' },
  saveBtn: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#10B981', fontSize: 14, textAlign: 'center', marginTop: 16, fontWeight: 'bold' },
});