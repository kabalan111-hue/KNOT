import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search conversations..." placeholderTextColor="#8899BB" />
      </View>
      <ScrollView style={styles.chatList}>
        <TouchableOpacity style={[styles.chatItem, styles.chatItemActive]}>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>A</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Text style={styles.chatName}>Ahmed Al-Rashid ✓</Text>
              <Text style={styles.chatTime}>2m ago</Text>
            </View>
            <Text style={styles.chatRole}>CEO • Al-Rashid Group</Text>
            <Text style={styles.chatPreview}>Looking forward to our meeting...</Text>
          </View>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>3</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatItem}>
          <View style={[styles.chatAvatar, {backgroundColor: '#9333EA'}]}>
            <Text style={styles.chatAvatarText}>F</Text>
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Text style={styles.chatName}>Fatima Al-Zahra ✓</Text>
              <Text style={styles.chatTime}>1h ago</Text>
            </View>
            <Text style={styles.chatRole}>Senior Architect • Freelancer</Text>
            <Text style={styles.chatPreview}>I sent you my portfolio PDF</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatItem}>
          <View style={[styles.chatAvatar, {backgroundColor: '#10B981'}]}>
            <Text style={styles.chatAvatarText}>M</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatTopRow}>
              <Text style={styles.chatName}>Mohammed Hassan ✓</Text>
              <Text style={styles.chatTime}>3h ago</Text>
            </View>
            <Text style={styles.chatRole}>Investment Manager • Doha</Text>
            <Text style={styles.chatPreview}>Can we schedule a video interview?</Text>
          </View>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>1</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.chatPreviewCard}>
          <Text style={styles.chatPreviewTitle}>💬 Chat with Ahmed</Text>
          <View style={styles.messageReceived}>
            <Text style={styles.messageText}>Hi Shadi! Saw your KNOT profile. Very impressive!</Text>
            <Text style={styles.messageTime}>10:30 AM</Text>
          </View>
          <View style={styles.messageSent}>
            <Text style={styles.messageTextSent}>Thank you! Would love to connect.</Text>
            <Text style={styles.messageTimeSent}>10:32 AM</Text>
          </View>
          <View style={styles.messageReceived}>
            <Text style={styles.messageText}>Looking forward to our meeting tomorrow!</Text>
            <Text style={styles.messageTime}>10:35 AM</Text>
          </View>
          <View style={styles.chatActions}>
            <TouchableOpacity style={styles.chatActionBtn}>
              <Text style={styles.chatActionText}>📎 Send CV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatActionBtnGold}>
              <Text style={styles.chatActionTextGold}>📹 Video Call</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.messageInput}>
            <TextInput style={styles.messageInputField} placeholder="Type a message..." placeholderTextColor="#8899BB" />
            <TouchableOpacity style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  iconText: { fontSize: 18 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', margin: 20, marginTop: 0, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2E5FA3' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', paddingVertical: 12, fontSize: 14 },
  chatList: { flex: 1 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A3A6B' },
  chatItemActive: { backgroundColor: '#1A3A6B' },
  chatAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' },
  chatAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#0A1628' },
  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatName: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  chatTime: { fontSize: 11, color: '#8899BB' },
  chatRole: { fontSize: 11, color: '#C9A84C', marginBottom: 2 },
  chatPreview: { fontSize: 13, color: '#8899BB' },
  unreadBadge: { backgroundColor: '#C9A84C', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  unreadText: { color: '#0A1628', fontSize: 11, fontWeight: 'bold' },
  chatPreviewCard: { backgroundColor: '#1A3A6B', margin: 20, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2E5FA3' },
  chatPreviewTitle: { color: '#C9A84C', fontWeight: 'bold', fontSize: 14, marginBottom: 16 },
  messageReceived: { backgroundColor: '#0A1628', borderRadius: 12, borderBottomLeftRadius: 4, padding: 12, marginBottom: 8, maxWidth: '80%', alignSelf: 'flex-start' },
  messageSent: { backgroundColor: '#C9A84C', borderRadius: 12, borderBottomRightRadius: 4, padding: 12, marginBottom: 8, maxWidth: '80%', alignSelf: 'flex-end' },
  messageText: { color: '#FFFFFF', fontSize: 13 },
  messageTextSent: { color: '#0A1628', fontSize: 13 },
  messageTime: { color: '#8899BB', fontSize: 10, marginTop: 4 },
  messageTimeSent: { color: '#1A3A6B', fontSize: 10, marginTop: 4 },
  chatActions: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  chatActionBtn: { flex: 1, backgroundColor: '#0A1628', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2E5FA3' },
  chatActionBtnGold: { flex: 1, backgroundColor: '#C9A84C', borderRadius: 10, padding: 10, alignItems: 'center' },
  chatActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  chatActionTextGold: { color: '#0A1628', fontSize: 13, fontWeight: 'bold' },
  messageInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A1628', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2E5FA3', gap: 10 },
  messageInputField: { flex: 1, color: '#FFFFFF', paddingVertical: 12, fontSize: 14 },
  sendBtn: { backgroundColor: '#C9A84C', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#0A1628', fontSize: 16, fontWeight: 'bold' },
});