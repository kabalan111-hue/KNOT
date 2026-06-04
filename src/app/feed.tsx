import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FeedScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KNOT</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.iconText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Search professionals..." placeholderTextColor="#8899BB" />
      </View>
      <View style={styles.createPost}>
        <View style={styles.createAvatar}>
          <Text style={styles.createAvatarText}>S</Text>
        </View>
        <TouchableOpacity style={styles.createInput}>
          <Text style={styles.createInputText}>Share a professional update...</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>S</Text>
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postName}>Shadi Kabalan</Text>
            <Text style={styles.postTitle}>Founder & CEO • KNOT Technologies</Text>
            <Text style={styles.postTime}>2 hours ago • Qatar</Text>
          </View>
        </View>
        <Text style={styles.postContent}>KNOT is now live! No more paper business cards. One verified identity, shared in one tap.</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Like 124</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Comment 38</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.post}>
        <View style={styles.postHeader}>
          <View style={[styles.postAvatar, {backgroundColor: '#2E5FA3'}]}>
            <Text style={styles.postAvatarText}>A</Text>
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postName}>Ahmed Al-Rashid</Text>
            <Text style={styles.postTitle}>CEO • Al-Rashid Group</Text>
            <Text style={styles.postTime}>5 hours ago • Dubai</Text>
          </View>
        </View>
        <Text style={styles.postContent}>Connected with 50+ professionals at Qatar Business Forum using KNOT QR. The future of networking is here!</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Like 89</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Comment 21</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 12 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#C9A84C', letterSpacing: 6 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { backgroundColor: '#1A3A6B', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', margin: 20, marginTop: 0, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#2E5FA3' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', paddingVertical: 12, fontSize: 14 },
  createPost: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 16, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: '#2E5FA3' },
  createAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center' },
  createAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#0A1628' },
  createInput: { flex: 1, backgroundColor: '#0A1628', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#2E5FA3' },
  createInputText: { color: '#8899BB', fontSize: 13 },
  post: { backgroundColor: '#1A3A6B', marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2E5FA3' },
  postHeader: { flexDirection: 'row', marginBottom: 12, gap: 10 },
  postAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#C9A84C', alignItems: 'center', justifyContent: 'center' },
  postAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  postInfo: { flex: 1 },
  postName: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  postTitle: { fontSize: 12, color: '#C9A84C', marginTop: 2 },
  postTime: { fontSize: 11, color: '#8899BB', marginTop: 2 },
  postContent: { fontSize: 14, color: '#FFFFFF', lineHeight: 22, marginBottom: 14 },
  postActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2E5FA3', paddingTop: 12, gap: 8 },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, backgroundColor: '#0A1628', borderRadius: 8 },
  actionText: { color: '#8899BB', fontSize: 12 },
});