import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function CheckinScreen() {
  const params = useLocalSearchParams();
  const eventId = (params.event as string) || '';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<any>(null);

  async function handleCheckin() {
    setError('');

    if (!fullName.trim()) {
      setError('الرجاء إدخال الاسم');
      return;
    }
    if (!eventId) {
      setError('رابط غير صالح — رمز المعرض مفقود');
      return;
    }

    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc('quick_checkin', {
      p_event_id: eventId,
      p_full_name: fullName.trim(),
      p_phone: phone.trim(),
    });
    setLoading(false);

    if (rpcError) {
      setError('حدث خطأ، حاول مرة أخرى');
      return;
    }
    if (data?.error === 'event_not_found') {
      setError('المعرض غير موجود');
      return;
    }
    if (data?.error === 'name_required') {
      setError('الرجاء إدخال الاسم');
      return;
    }
    if (data?.success) {
      setDone(data);
    }
  }

  // شاشة الترحيب بعد الدخول
  if (done) {
    return (
      <ScrollView contentContainerStyle={styles.successWrap}>
        <View style={styles.successCard}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.welcomeText}>أهلاً وسهلاً</Text>
          <Text style={styles.welcomeName}>{done.name}</Text>
          <Text style={styles.welcomeSub}>تم تسجيل دخولك بنجاح إلى</Text>
          <Text style={styles.welcomeEvent}>{done.event}</Text>
          <View style={styles.successDivider} />
          <Text style={styles.enjoyText}>نتمنى لك وقتاً ممتعاً 🎉</Text>
        </View>
      </ScrollView>
    );
  }

  // شاشة التسجيل
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerSub}>تسجيل الدخول السريع</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>مرحباً بك في المعرض</Text>
        <Text style={styles.cardSub}>أدخل بياناتك للدخول مباشرة</Text>

        <Text style={styles.label}>الاسم الكامل</Text>
        <TextInput
          style={styles.input}
          placeholder="اكتب اسمك"
          placeholderTextColor="#5A6E94"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>رقم الهاتف</Text>
        <TextInput
          style={styles.input}
          placeholder="55xxxxxx"
          placeholderTextColor="#5A6E94"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleCheckin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0A1628" />
          ) : (
            <Text style={styles.buttonText}>دخول</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footnote}>بالدخول، يتم إنشاء بطاقة هوية رقمية لك على KNOT</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40 },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 10 },
  logo: { fontSize: 38, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 10 },
  headerSub: { fontSize: 13, color: '#8899BB', marginTop: 6 },
  card: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#C9A84C' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#8899BB', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, color: '#C9A84C', fontWeight: 'bold', marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: '#0A1628', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#2E5FA3', marginBottom: 16, textAlign: 'right' },
  button: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0A1628', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: '#FF6B6B', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  footnote: { fontSize: 11, color: '#5A6E94', textAlign: 'center', marginTop: 16 },
  successWrap: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#0A1628', padding: 20 },
  successCard: { backgroundColor: '#1A3A6B', borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: '#10B981' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  checkMark: { color: '#FFFFFF', fontSize: 44, fontWeight: 'bold' },
  welcomeText: { fontSize: 16, color: '#8899BB' },
  welcomeName: { fontSize: 26, fontWeight: 'bold', color: '#C9A84C', marginVertical: 6, textAlign: 'center' },
  welcomeSub: { fontSize: 14, color: '#8899BB', marginTop: 12 },
  welcomeEvent: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginTop: 4 },
  successDivider: { width: '60%', height: 1, backgroundColor: '#2E5FA3', marginVertical: 20 },
  enjoyText: { fontSize: 16, color: '#FFFFFF' },
});