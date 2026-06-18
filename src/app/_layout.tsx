import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A3A6B',
          borderTopColor: '#2E5FA3',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#C9A84C',
        tabBarInactiveTintColor: '#8899BB',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: () => <Text style={{fontSize: 22}}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: 'My ID',
          tabBarIcon: () => <Text style={{fontSize: 22}}>🆔</Text>,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: () => <Text style={{fontSize: 22}}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: () => <Text style={{fontSize: 22}}>🔔</Text>,
        }}
      />

      <Tabs.Screen name="checkin" options={{ href: null }} />
      <Tabs.Screen name="feed" options={{ href: null }} />
      <Tabs.Screen name="jobs" options={{ href: null }} />
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="verify" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="exhibitions" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="p/[slug]" options={{ href: null }} />
    </Tabs>
  );
}