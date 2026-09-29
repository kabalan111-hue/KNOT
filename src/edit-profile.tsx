import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

const fields = [
  { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'username فقط' },
  { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'مثال: shadi_kabalan' },
  { key: 'facebook', label: 'Facebook', icon: '👥', placeholder: 'username فقط' },
  { key: 'twitter', label: 'X (Twitter)', icon: '🐦', placeholder: 'مثال: shadi_kabalan' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💚', placeholder: 'مثال: 0097466622960' },
  { key: 'website', label: 'Website', icon: '🌐', placeholder: 'مثال: www.static-group.com' },
  { key: 'contact_email', label: 'Email', icon: '✉️', placeholder: 'مثال: name@mail.com' },
];

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('خطأ', 'لازم تسجّل دخول أول');
        setLoading(false);
        return;
      }
      setUserId(user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('linkedin, instagram, facebook, twitter, whatsapp, website, contact_email')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      const v: Record<string, string> = {};
      fields.forEach((f) => {
        v[f.key] = data?.[f.key] || '';
      });
      setValues(v);
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'ما قدرنا نجيب البيانات');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      const updates: Record<string, string | null> = {};
      fields.forEach((f) => {
        const val = (values[f.key] || '').trim();
        updates[f.key] = val === '' ? null : val;
      });
      const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
      if (error) throw error;
      Alert.alert('تم ✅', 'انحفظت التعديلات', [
        { text: 'حسناً', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('خطأ', e.message || 'ما قدرنا نحفظ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f5c451" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>‹ رجوع</Text>
      </TouchableOpacity>

      <Text style={styles.title}>تعديل الروابط</Text>
      <Text style={styles.subtitle}>
        حط اسم المستخدم فقط (مش الرابط الكامل). خلّي الخانة فاضية إذا ما بدك الرابط يظهر.
      </Text>

      {fields.map((f) => (
        <View key={f.key} style={styles.fieldGroup}>
          <Text style={styles.label}>
            {f.icon}  {f.label}
          </Text>
          <TextInput
            style={styles.input}
            value={values[f.key]}
            onChangeText={(t) => setValues((prev) => ({ ...prev, [f.key]: t }))}
            placeholder={f.placeholder}
            placeholderTextColor="#5a6b8a"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'عم يحفظ...' : 'حفظ التعديلات'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  content: { padding: 20 },
  center: { flex: 1, backgroundColor: '#0a1628', justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 10 },
  backText: { color: '#f5c451', fontSize: 18, fontWeight: '600' },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#9fb0cc', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  fieldGroup: { marginBottom: 18 },
  label: { color: '#dfe7f5', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: '#1a2942',
    borderWidth: 1,
    borderColor: '#2a3c5c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: '#f5c451',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: { color: '#0a1628', fontSize: 18, fontWeight: 'bold' },
});