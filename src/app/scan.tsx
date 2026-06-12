import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ScanScreen() {
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsOrganizer(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_organizer')
        .eq('id', user.id)
        .single();

      setIsOrganizer(profile?.is_organizer === true);

      const { data: eventList } = await supabase
        .from('events')
        .select('id, name')
        .order('starts_on', { ascending: true });

      setEvents(eventList || []);
    }
    init();
  }, []);

  async function startScanner() {
    if (Platform.OS !== 'web') return;
    setResult(null);
    setScanning(true);

    const { Html5Qrcode } = await import('html5-qrcode');
    setTimeout(async () => {
      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            await handleScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        setResult({ status: 'error', message: 'Camera error' });
        setScanning(false);
      }
    }, 300);
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleScan(decodedText: string) {
    let slug = decodedText.trim();
    const match = slug.match(/\/p\/([^/?#]+)/);
    if (match) slug = match[1];

    await stopScanner();

    const { data, error } = await supabase.rpc('checkin_scan', {
      p_slug: slug,
      p_event_id: selectedEvent.id,
    });

    if (error) {
      setResult({ status: 'error', message: error.message });
    } else {
      setResult(data);
    }
  }

  if (isOrganizer === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  if (isOrganizer === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.denied}>Access restricted to organizers</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>KNOT</Text>
      <Text style={styles.headerSub}>Event Check-in Scanner</Text>

      {!selectedEvent && (
        <View style={styles.section}>
          <Text style={styles.label}>Select your event:</Text>
          {events.map((ev) => (
            <TouchableOpacity key={ev.id} style={styles.eventBtn} onPress={() => setSelectedEvent(ev)}>
              <Text style={styles.eventBtnText}>{ev.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedEvent && (
        <View style={styles.section}>
          <Text style={styles.eventActive}>{selectedEvent.name}</Text>
          <TouchableOpacity style={styles.changeEvent} onPress={() => { setSelectedEvent(null); stopScanner(); setResult(null); }}>
            <Text style={styles.changeEventText}>Change event</Text>
          </TouchableOpacity>

          {!scanning && (
            <TouchableOpacity style={styles.scanBtn} onPress={startScanner}>
              <Text style={styles.scanBtnText}>Start scanning</Text>
            </TouchableOpacity>
          )}

          {scanning && (
            <View>
              <View nativeID="reader" style={styles.reader} />
              <TouchableOpacity style={styles.stopBtn} onPress={stopScanner}>
                <Text style={styles.stopBtnText}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          {result && (
            <View style={[
              styles.resultBox,
              result.status === 'checked_in' && styles.resultIn,
              result.status === 'checked_out' && styles.resultOut,
              (result.status === 'not_found' || result.status === 'error') && styles.resultError,
            ]}>
              {result.status === 'checked_in' && (
                <>
                  <Text style={styles.resultBig}>✓ Checked In</Text>
                  <Text style={styles.resultName}>{result.full_name}</Text>
                  <Text style={styles.resultMeta}>{result.title}</Text>
                </>
              )}
              {result.status === 'checked_out' && (
                <>
                  <Text style={styles.resultBig}>↩ Checked Out</Text>
                  <Text style={styles.resultName}>{result.full_name}</Text>
                  <Text style={styles.resultMeta}>{result.title}</Text>
                </>
              )}
              {result.status === 'not_found' && (
                <Text style={styles.resultBig}>Profile not found</Text>
              )}
              {result.status === 'error' && (
                <Text style={styles.resultBig}>Error: {result.message}</Text>
              )}

              <TouchableOpacity style={styles.nextBtn} onPress={startScanner}>
                <Text style={styles.nextBtnText}>Scan next</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  centered: { flex: 1, backgroundColor: '#0A1628', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 8 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4, marginBottom: 30 },
  denied: { color: '#FFFFFF', fontSize: 16, marginTop: 20 },
  section: { width: '100%', maxWidth: 420, alignItems: 'center' },
  label: { color: '#8899BB', fontSize: 14, marginBottom: 16 },
  eventBtn: { backgroundColor: '#1A3A6B', borderRadius: 12, padding: 18, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#C9A84C' },
  eventBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  eventActive: { color: '#C9A84C', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  changeEvent: { marginBottom: 24 },
  changeEventText: { color: '#8899BB', fontSize: 13, textDecorationLine: 'underline' },
  scanBtn: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 40, width: '100%' },
  scanBtnText: { color: '#0A1628', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  reader: { width: 300, height: 300, backgroundColor: '#000000', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  stopBtn: { backgroundColor: '#1A3A6B', borderRadius: 12, paddingVertical: 12, width: '100%' },
  stopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  resultBox: { width: '100%', borderRadius: 16, padding: 24, alignItems: 'center', marginTop: 10 },
  resultIn: { backgroundColor: '#10B981' },
  resultOut: { backgroundColor: '#3B6EA5' },
  resultError: { backgroundColor: '#B91C1C' },
  resultBig: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  resultName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  resultMeta: { color: '#E0E8F5', fontSize: 14, marginTop: 4, textAlign: 'center' },
  nextBtn: { backgroundColor: '#0A1628', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, marginTop: 20, width: '100%' },
  nextBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
});