import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

const socialFields = [
  { key: 'website', label: '🌐 Website', placeholder: 'www.static-group.com' },
  { key: 'linkedin', label: '💼 LinkedIn', placeholder: 'company username' },
  { key: 'instagram', label: '📷 Instagram', placeholder: 'username' },
  { key: 'facebook', label: '👥 Facebook', placeholder: 'username' },
  { key: 'twitter', label: '🐦 X (Twitter)', placeholder: 'username' },
  { key: 'whatsapp', label: '💚 WhatsApp', placeholder: 'رقم مع رمز الدولة' },
  { key: 'contact_email', label: '✉️ Email', placeholder: 'info@company.com' },
];

export default function EditCompanyScreen() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCat, setUploadingCat] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setOwnerId(user.id);
      const { data } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle();
      if (data) {
        setCompanyId(data.id);
        setName(data.name || '');
        setDescription(data.description || '');
        setLogoUrl(data.logo_url || '');
        setCatalogUrl(data.catalog_url || '');
        const s: Record<string, string> = {};
        socialFields.forEach((f) => { s[f.key] = data[f.key] || ''; });
        setSocials(s);
      }
    }
    load();
  }, []);

  async function handlePickLogo() {
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
      const fileName = `company-${ownerId}-${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, blob, { contentType: blob.type || `image/${fileExt}`, upsert: true });
      if (upErr) { setMessage('Error: ' + upErr.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setLogoUrl(urlData.publicUrl);
      setMessage('Logo uploaded');
    } catch (e: any) {
      setMessage('Error: ' + (e?.message || 'could not upload logo'));
    }
    setUploading(false);
  }

  async function uploadCatFile(file: Blob) {
    setUploadingCat(true);
    setMessage('');
    try {
      const fileName = `catalog-${ownerId}-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from('catalogs').upload(fileName, file, { contentType: 'application/pdf', upsert: true });
      if (upErr) { setMessage('Error: ' + upErr.message); setUploadingCat(false); return; }
      const { data: urlData } = supabase.storage.from('catalogs').getPublicUrl(fileName);
      setCatalogUrl(urlData.publicUrl);
      setMessage('Catalog uploaded');
    } catch (e: any) {
      setMessage('Error: ' + (e?.message || 'could not upload catalog'));
    }
    setUploadingCat(false);
  }

  function handlePickCatalog() {
    if (Platform.OS !== 'web') {
      setMessage('رفع الكتالوج مدعوم حالياً على النسخة الإلكترونية');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => {
      const file = e?.target?.files?.[0];
      if (file) uploadCatFile(file);
    };
    input.click();
  }

  function handleViewCatalog() {
    if (!catalogUrl) return;
    if (Platform.OS === 'web') window.open(catalogUrl, '_blank');
    else Linking.openURL(catalogUrl);
  }

  async function handleSave() {
    if (!ownerId) return;
    if (!name.trim()) { setMessage('الرجاء إدخال اسم الشركة'); return; }
    setSaving(true);
    setMessage('');
    const record: Record<string, any> = {
      owner_id: ownerId,
      name: name.trim(),
      description: description.trim() || null,
      logo_url: logoUrl || null,
      catalog_url: catalogUrl || null,
    };
    socialFields.forEach((f) => {
      const val = (socials[f.key] || '').trim();
      record[f.key] = val === '' ? null : val;
    });

    let error;
    if (companyId) {
      ({ error } = await supabase.from('company_profiles').update(record).eq('id', companyId));
    } else {
      const { data, error: insErr } = await supabase.from('company_profiles').insert(record).select('id').single();
      error = insErr;
      if (data) setCompanyId(data.id);
    }
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
        <Text style={styles.headerTitle}>{companyId ? 'Edit Company' : 'Create Company'}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.logoSection}>
        <View style={styles.logo}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoText}>{name ? name.charAt(0) : '🏢'}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.changeLogoBtn} onPress={handlePickLogo} disabled={uploading}>
          <Text style={styles.changeLogoText}>{uploading ? 'Uploading...' : '📷 Company Logo'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Company Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Company name" placeholderTextColor="#8899BB" />

        <Text style={styles.label}>About / Description</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="What the company does" placeholderTextColor="#8899BB" multiline numberOfLines={4} />

        <Text style={styles.sectionTitle}>📚 Catalog (PDF)</Text>
        <Text style={styles.sectionHint}>ارفع كتالوج الشركة بصيغة PDF ليتمكن الآخرون من تصفحه.</Text>
        <View style={styles.cvRow}>
          <TouchableOpacity style={styles.cvBtn} onPress={handlePickCatalog} disabled={uploadingCat}>
            <Text style={styles.cvBtnText}>{uploadingCat ? 'Uploading...' : (catalogUrl ? '🔄 Replace Catalog' : '⬆️ Upload Catalog')}</Text>
          </TouchableOpacity>
          {catalogUrl ? (
            <TouchableOpacity style={styles.cvViewBtn} onPress={handleViewCatalog}>
              <Text style={styles.cvViewText}>👁️ View</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {catalogUrl ? <Text style={styles.cvStatus}>✅ Catalog مرفوع</Text> : null}

        <Text style={styles.sectionTitle}>🔗 Company Links</Text>
        <Text style={styles.sectionHint}>حط اسم المستخدم فقط. خلّي الخانة فاضية إذا ما بدك الرابط يظهر.</Text>
        {socialFields.map((f) => (
          <View key={f.key}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={socials[f.key] || ''}
              onChangeText={(t) => setSocials((prev) => ({ ...prev, [f.key]: t }))}
              placeholder={f.placeholder}
              placeholderTextColor="#8899BB"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backText: { color: '#C9A84C', fontSize: 16, fontWeight: 'bold', width: 50 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  logoSection: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 100, height: 100, borderRadius: 20, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12 },
  logoImage: { width: 100, height: 100, borderRadius: 20 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: '#0A1628' },
  changeLogoBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9A84C', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  changeLogoText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 14 },
  form: { paddingHorizontal: 20 },
  label: { color: '#8899BB', fontSize: 13, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#1A3A6B', borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2E5FA3' },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#C9A84C', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 30 },
  saveBtnText: { color: '#0A1628', fontWeight: 'bold', fontSize: 16 },
  message: { color: '#10B981', fontSize: 14, textAlign: 'center', marginTop: 16, fontWeight: 'bold' },
  sectionTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', marginTop: 30 },
  sectionHint: { color: '#8899BB', fontSize: 12, marginTop: 4, lineHeight: 18 },
  cvRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cvBtn: { flex: 1, backgroundColor: '#1A3A6B', borderWidth: 1, borderColor: '#2E5FA3', borderRadius: 12, padding: 14, alignItems: 'center' },
  cvBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cvViewBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#C9A84C', borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  cvViewText: { color: '#C9A84C', fontWeight: 'bold', fontSize: 14 },
  cvStatus: { color: '#10B981', fontSize: 13, marginTop: 8, fontWeight: 'bold' },
});
