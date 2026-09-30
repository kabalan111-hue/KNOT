import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ReportsScreen() {
  const [isOrganizer, setIsOrganizer] = useState<boolean | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [tab, setTab] = useState<'inside' | 'search' | 'time' | 'peak'>('inside');

  const [insideList, setInsideList] = useState<any[]>([]);
  const [loadingInside, setLoadingInside] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [timeValue, setTimeValue] = useState('');
  const [timeResults, setTimeResults] = useState<any[]>([]);

  const [peakData, setPeakData] = useState<any>(null);
  const [loadingPeak, setLoadingPeak] = useState(false);

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

  async function loadInside(ev: any) {
    setLoadingInside(true);
    const { data } = await supabase.rpc('report_currently_inside', { p_event_id: ev.id });
    setInsideList(data?.inside || []);
    setLoadingInside(false);
  }

  async function loadPeak(ev: any) {
    setLoadingPeak(true);
    const { data } = await supabase.rpc('report_peak_times', { p_event_id: ev.id });
    setPeakData(data || null);
    setLoadingPeak(false);
  }

  function selectEvent(ev: any) {
    setSelectedEvent(ev);
    setTab('inside');
    setSearchResults([]);
    setTimeResults([]);
    setSearchQuery('');
    setTimeValue('');
    setPeakData(null);
    loadInside(ev);
  }

  async function runSearch() {
    if (!searchQuery.trim()) return;
    const { data } = await supabase.rpc('report_search_person', {
      p_event_id: selectedEvent.id,
      p_query: searchQuery.trim(),
    });
    setSearchResults(data?.results || []);
  }

  async function runTimeSearch() {
    if (!timeValue.trim()) return;
    const isoTime = new Date(timeValue).toISOString();
    const { data } = await supabase.rpc('report_at_time', {
      p_event_id: selectedEvent.id,
      p_time: isoTime,
    });
    setTimeResults(data?.present || []);
  }

  function fmtTime(t: string) {
    if (!t) return '—';
    return new Date(t).toLocaleString();
  }

  function fmtHour(h: number) {
    if (h === null || h === undefined) return '—';
    const period = h < 12 ? 'AM' : 'PM';
    let hr12 = h % 12;
    if (hr12 === 0) hr12 = 12;
    return `${hr12}:00 ${period}`;
  }

  function exportPDF() {
    const rows = insideList.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.full_name || '—'}</td>
        <td>${p.title || '—'}</td>
        <td>${p.company || '—'}</td>
        <td>${p.phone || '—'}</td>
        <td>${fmtTime(p.checked_in_at)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>KNOT Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #0A1628; }
            h1 { color: #C9A84C; letter-spacing: 4px; margin-bottom: 4px; }
            h2 { margin: 0 0 4px 0; font-size: 18px; }
            .meta { color: #555; font-size: 13px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px 10px; font-size: 13px; text-align: left; }
            th { background: #0A1628; color: #fff; }
            tr:nth-child(even) { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>KNOT</h1>
          <h2>${selectedEvent?.name || ''}</h2>
          <div class="meta">
            Report: Currently Inside &nbsp;|&nbsp;
            Total: ${insideList.length} &nbsp;|&nbsp;
            Generated: ${new Date().toLocaleString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Title</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Check-in time</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
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
      <Text style={styles.headerSub}>Event Reports</Text>

      {!selectedEvent && (
        <View style={styles.section}>
          <Text style={styles.label}>Select event:</Text>
          {events.map((ev) => (
            <TouchableOpacity key={ev.id} style={styles.eventBtn} onPress={() => selectEvent(ev)}>
              <Text style={styles.eventBtnText}>{ev.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedEvent && (
        <View style={styles.section}>
          <Text style={styles.eventActive}>{selectedEvent.name}</Text>
          <TouchableOpacity style={styles.changeEvent} onPress={() => setSelectedEvent(null)}>
            <Text style={styles.changeEventText}>Change event</Text>
          </TouchableOpacity>

          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, tab === 'inside' && styles.tabActive]} onPress={() => { setTab('inside'); loadInside(selectedEvent); }}>
              <Text style={[styles.tabText, tab === 'inside' && styles.tabTextActive]}>Inside now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'peak' && styles.tabActive]} onPress={() => { setTab('peak'); loadPeak(selectedEvent); }}>
              <Text style={[styles.tabText, tab === 'peak' && styles.tabTextActive]}>Peak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'search' && styles.tabActive]} onPress={() => setTab('search')}>
              <Text style={[styles.tabText, tab === 'search' && styles.tabTextActive]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'time' && styles.tabActive]} onPress={() => setTab('time')}>
              <Text style={[styles.tabText, tab === 'time' && styles.tabTextActive]}>By time</Text>
            </TouchableOpacity>
          </View>

          {tab === 'inside' && (
            <View style={styles.panel}>
              <Text style={styles.countBig}>{insideList.length}</Text>
              <Text style={styles.countLabel}>Currently inside</Text>
              {!loadingInside && insideList.length > 0 && (
                <TouchableOpacity style={styles.exportBtn} onPress={exportPDF}>
                  <Text style={styles.exportBtnText}>📄 Export PDF</Text>
                </TouchableOpacity>
              )}
              {loadingInside && <ActivityIndicator color="#C9A84C" style={{ marginTop: 20 }} />}
              {!loadingInside && insideList.length === 0 && <Text style={styles.empty}>No one inside right now</Text>}
              {insideList.map((p, i) => (
                <View key={i} style={styles.personRow}>
                  <Text style={styles.personName}>{p.full_name}</Text>
                  <Text style={styles.personMeta}>{p.title} {p.company ? '• ' + p.company : ''}</Text>
                  <Text style={styles.personMeta}>📞 {p.phone || '—'}</Text>
                  <Text style={styles.personTime}>In: {fmtTime(p.checked_in_at)}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'peak' && (
            <View style={styles.panel}>
              {loadingPeak && <ActivityIndicator color="#C9A84C" style={{ marginTop: 20 }} />}
              {!loadingPeak && peakData && peakData.total === 0 && <Text style={styles.empty}>No check-ins yet</Text>}
              {!loadingPeak && peakData && peakData.total > 0 && (
                <>
                  <Text style={styles.countBig}>{fmtHour(peakData.busiest_hour)}</Text>
                  <Text style={styles.countLabel}>Peak hour · {peakData.busiest_count} check-ins</Text>
                  <Text style={styles.peakTotal}>Total check-ins: {peakData.total}</Text>
                  <View style={styles.peakChart}>
                    {peakData.hours.map((h: any) => (
                      <View key={h.hour} style={styles.peakRow}>
                        <Text style={styles.peakHour}>{fmtHour(h.hour)}</Text>
                        <View style={styles.peakBarBg}>
                          <View style={[styles.peakBarFill, { width: `${Math.max((h.count / peakData.busiest_count) * 100, 6)}%` }]} />
                        </View>
                        <Text style={styles.peakCount}>{h.count}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {tab === 'search' && (
            <View style={styles.panel}>
              <TextInput
                style={styles.input}
                placeholder="Name or phone number"
                placeholderTextColor="#8899BB"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.runBtn} onPress={runSearch}>
                <Text style={styles.runBtnText}>Search</Text>
              </TouchableOpacity>
              {searchResults.length === 0 && <Text style={styles.empty}>No results yet</Text>}
              {searchResults.map((p, i) => (
                <View key={i} style={styles.personRow}>
                  <Text style={styles.personName}>{p.full_name}</Text>
                  <Text style={styles.personMeta}>{p.title} {p.company ? '• ' + p.company : ''}</Text>
                  <Text style={styles.personMeta}>📞 {p.phone || '—'}</Text>
                  <Text style={styles.personTime}>In: {fmtTime(p.checked_in_at)}</Text>
                  <Text style={styles.personTime}>Out: {fmtTime(p.checked_out_at)}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'time' && (
            <View style={styles.panel}>
              <Text style={styles.hint}>Enter date and time (e.g. 2026-02-15 15:30)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-02-15 15:30"
                placeholderTextColor="#8899BB"
                value={timeValue}
                onChangeText={setTimeValue}
              />
              <TouchableOpacity style={styles.runBtn} onPress={runTimeSearch}>
                <Text style={styles.runBtnText}>Who was present</Text>
              </TouchableOpacity>
              {timeResults.length === 0 && <Text style={styles.empty}>No results yet</Text>}
              {timeResults.map((p, i) => (
                <View key={i} style={styles.personRow}>
                  <Text style={styles.personName}>{p.full_name}</Text>
                  <Text style={styles.personMeta}>{p.title} {p.company ? '• ' + p.company : ''}</Text>
                  <Text style={styles.personMeta}>📞 {p.phone || '—'}</Text>
                  <Text style={styles.personTime}>In: {fmtTime(p.checked_in_at)}</Text>
                  <Text style={styles.personTime}>Out: {fmtTime(p.checked_out_at)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  content: { alignItems: 'center', paddingTop: 50, paddingBottom: 60, paddingHorizontal: 20 },
  centered: { flex: 1, backgroundColor: '#0A1628', alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 8 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4, marginBottom: 30 },
  denied: { color: '#FFFFFF', fontSize: 16, marginTop: 20 },
  section: { width: '100%', maxWidth: 480, alignItems: 'center' },
  label: { color: '#8899BB', fontSize: 14, marginBottom: 16 },
  eventBtn: { backgroundColor: '#1A3A6B', borderRadius: 12, padding: 18, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#C9A84C' },
  eventBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  eventActive: { color: '#C9A84C', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  changeEvent: { marginBottom: 20 },
  changeEventText: { color: '#8899BB', fontSize: 13, textDecorationLine: 'underline' },
  tabs: { flexDirection: 'row', width: '100%', marginBottom: 20, gap: 6 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#1A3A6B', borderWidth: 1, borderColor: '#2E5FA3' },
  tabActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  tabText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  tabTextActive: { color: '#0A1628' },
  panel: { width: '100%', alignItems: 'center' },
  countBig: { fontSize: 44, fontWeight: 'bold', color: '#10B981', textAlign: 'center' },
  countLabel: { fontSize: 14, color: '#8899BB', marginBottom: 6 },
  peakTotal: { fontSize: 13, color: '#C9A84C', marginBottom: 16 },
  exportBtn: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginBottom: 20 },
  exportBtnText: { color: '#0A1628', fontSize: 14, fontWeight: 'bold' },
  empty: { color: '#8899BB', fontSize: 14, marginTop: 16 },
  hint: { color: '#8899BB', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#1A3A6B', borderRadius: 12, padding: 16, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2E5FA3', marginBottom: 12 },
  runBtn: { backgroundColor: '#C9A84C', borderRadius: 12, paddingVertical: 14, width: '100%', marginBottom: 16 },
  runBtnText: { color: '#0A1628', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  personRow: { width: '100%', backgroundColor: '#1A3A6B', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2E5FA3' },
  personName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  personMeta: { color: '#8899BB', fontSize: 13, marginTop: 2 },
  personTime: { color: '#C9A84C', fontSize: 12, marginTop: 4 },
  peakChart: { width: '100%', marginTop: 10 },
  peakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  peakHour: { color: '#8899BB', fontSize: 12, width: 70 },
  peakBarBg: { flex: 1, height: 22, backgroundColor: '#1A3A6B', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#2E5FA3' },
  peakBarFill: { height: '100%', backgroundColor: '#C9A84C', borderRadius: 6 },
  peakCount: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', width: 28, textAlign: 'right' },
});
