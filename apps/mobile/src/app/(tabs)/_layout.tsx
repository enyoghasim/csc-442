import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { fontFamily: 'Google Sans SemiBold', color: '#ffffff' },
        headerTintColor: '#ffffff',
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#27272a' },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontFamily: 'Google Sans Medium' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="attendance" options={{ title: 'My Attendance' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
