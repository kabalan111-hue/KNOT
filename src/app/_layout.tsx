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
    </Tabs>
  );
}