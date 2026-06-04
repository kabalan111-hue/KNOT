import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QRScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerSub}>My Digital Identity</Text>
      </View>
      <View style={styles.profileMini}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <View>
          <Text style={styles.name}>Shadi Kabalan</Text>
          <Text style={styles.title}>Founder & CEO • KNOT</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      </View>
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Scan to View My Identity</Text>
        <Text style={styles.qrSub}>Point any camera to connect instantly</Text>
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.qrCenter}>
              <Text style={styles.qrCenterText}>K</Text>
            </View>
          </View>
        </View>
        <View style={styles.urlBox}>
          <Text style={styles.urlText}>knot.app/shadi-kabalan</Text>
        </View>
      </View>
      <View style={styles.shareGrid}>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>🔗</Text>
          <Text style={styles.shareBtnText}>Copy Link</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>💾</Text>
          <Text style={styles.shareBtnText}>Save QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareIcon}>📡</Text>
          <Text style={styles.shareBtnText}>NFC Tap</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>1.2K</Text>
          <Text style={styles.statLabel}>Scans</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>340</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>28</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 16 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 8 },
  headerSub: { fontSize: 12, color: '#8899BB', marginTop: 4 },
  profileMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', margin: 20, marginBottom: 0, borderRadius: 14, padding: 14, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#0A1628' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  title: { fontSize: 12, color: '#8899BB', marginTop: 2 },
  badge: { marginLeft: 'auto', backgroundColor: '#10B981', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  qrCard: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#C9A84C' },
  qrTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  qrSub: { fontSize: 12, color: '#8899BB', marginBottom: 20 },
  qrContainer: { padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16 },
  qrBox: { width: 180, height: 180, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#0A1628' },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#0A1628' },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#0A1628' },
  qrCenter: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center' },
  qrCenterText: { fontSize: 18, fontWeight: 'bold', color: '#0A1628' },
  urlBox: { backgroundColor: '#0A1628', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2E5FA3' },
  urlText: { color: '#C9A84C', fontSize: 13, fontWeight: 'bold' },
  shareGrid: { flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 20 },
  shareBtn: { flex: 1, backgroundColor: '#1A3A6B', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2E5FA3' },
  shareIcon: { fontSize: 22, marginBottom: 4 },
  shareBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: '#1A3A6B', margin: 20, marginTop: 0, borderRadius: 14, padding: 16, justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C' },
  statLabel: { fontSize: 11, color: '#8899BB', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2E5FA3' },
});