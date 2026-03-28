import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useApp } from '../../src/context/AppContext';
import { getTheme } from '../../src/theme';

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingBottom: 4,
  },
});

export default function TabsLayout() {
  const { mode } = useApp();
  const theme = getTheme(mode);

  const peaceTabs = [
    { name: 'index', title: 'Home', icon: '◉' },
    { name: 'community', title: 'People', icon: '◎' },
    { name: 'resources', title: 'Supply', icon: '◫' },
    { name: 'drills', title: 'Drills', icon: '⬡' },
    { name: 'plans', title: 'Plans', icon: '◈' },
    { name: 'settings', title: 'Config', icon: '⚙' },
  ];

  const crisisTabs = [
    { name: 'index', title: 'Status', icon: '◉' },
    { name: 'resources', title: 'Supply', icon: '◫' },
    { name: 'community', title: 'Mesh', icon: '◎' },
    { name: 'plans', title: 'Plans', icon: '◈' },
  ];

  const activeTabs = mode === 'crisis' ? crisisTabs : peaceTabs;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: '#808080',
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      {activeTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarLabel: tab.title,
            tabBarIcon: ({ focused }) => (
              <>{tab.icon}</>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
