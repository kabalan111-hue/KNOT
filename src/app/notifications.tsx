import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconText}>✓</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.list}>
        <Text style={styles.sectionTitle}>Jobs & Opportunities</Text>
        <TouchableOpacity style={[styles.notifItem, styles.notifUnread]}>
          <View style={[styles.notifIcon, {backgroundColor: '#10B981'}]}>
            <Text style={styles.notifIconText}>💼</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>New Job Match — 95% fit!</Text>
            <Text style={styles.notifBody}>Qatar Airways is looking for a Business Development Director. Your profile matches perfectly.</Text>
            <Text style={styles.notifTime}>2 minutes ago</Text>
          </View>
          <View style={styles.unreadDot} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.notifItem, styles.notifUnread]}>
          <View style={[styles.notifIcon, {backgroundColor: '#2E5FA3'}]}>
            <Text style={styles.notifIconText}>👤</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>New Candidate Match!</Text>
            <Text style={styles.notifBody}>A verified professional matches your open CEO position at KNOT Technologies.</Text>
            <Text style={styles.notifTime}>15 minutes ago</Text>
          </View>
          <View style={styles.unreadDot} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Profile Activity</Text>
        <TouchableOpacity style={styles.notifItem}>
          <View style={[styles.notifIcon, {backgroundColor: '#C9A84C'}]}>
            <Text style={styles.notifIconText}>👁️</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>12 people viewed your identity</Text>
            <Text style={styles.notifBody}>Your profile was viewed 12 times today. 3 are from Qatar Airways.</Text>
            <Text style={styles.notifTime}>1 hour ago</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifItem}>
          <View style={[styles.notifIcon, {backgroundColor: '#9333EA'}]}>
            <Text style={styles.notifIconText}>📱</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>Your QR was scanned 5 times</Text>
            <Text style={styles.notifBody}>5 professionals scanned your QR at Qatar Business Forum.</Text>
            <Text style={styles.notifTime}>3 hours ago</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Connections</Text>
        <TouchableOpacity style={[styles.notifItem, styles.notifUnread]}>
          <View style={[styles.notifIcon, {backgroundColor: '#10B981'}]}>
            <Text style={styles.notifIconText}>🤝</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>Ahmed Al-Rashid wants to connect</Text>
            <Text style={styles.notifBody}>CEO at Al-Rashid Group — Verified Blue Badge</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.acceptBtn}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.notifTime}>5 hours ago</Text>
          </View>
          <View style={styles.unreadDot} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Verification</Text>
        <TouchableOpacity style={styles.notifItem}>
          <View style={[styles.notifIcon, {backgroundColor: '#C9A84C'}]}>
            <Text style={styles.notifIconText}>✓</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>Blue Badge Approved!</Text>
            <Text style={styles.notifBody}>Your business verification is complete. Blue Badge is now active.</Text>
            <Text style={styles.notifTime}>Yesterday</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifItem}>
          <View style={[styles.notifIcon, {backgroundColor: '#F59E0B'}]}>
            <Text style={styles.notifIconText}>🎪</Text>
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>Exhibition Registration Confirmed</Text>
            <Text style={styles.notifBody}>You are registered for Qatar Tech Expo 2025. QR access card is ready.</Text>
            <TouchableOpacity style={styles.viewCardBtn}>
              <Text style={styles.viewCardText}>View Access Card</Text>
            </TouchableOpacity>
            <Text style={styles.notifTime}>2 days ago</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  logo: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  iconBtn: { backgroundColor: '#1A3A6B', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16, color: '#C9A84C', fontWeight: 'bold' },
  list: { flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#C9A84C', paddingHorizontal: 20, paddingVertical: 10 },
  notifItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A3A6B', alignItems: 'flex-start' },
  notifUnread: { backgroundColor: '#0D1E35' },
  notifIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifIconText: { fontSize: 20 },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  notifBody: { fontSize: 13, color: '#8899BB', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#C9A84C' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C9A84C', marginTop: 4, marginLeft: 8 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  acceptBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  acceptText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  declineBtn: { backgroundColor: '#1A3A6B', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#2E5FA3' },
  declineText: { color: '#8899BB', fontSize: 13 },
  viewCardBtn: { backgroundColor: '#C9A84C', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6 },
  viewCardText: { color: '#0A1628', fontWeight: 'bold', fontSize: 13 },
});