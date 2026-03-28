import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlanCard, SectionHeader } from '../../src/components';
import { useApp } from '../../src/context/AppContext';
import { useCommunity } from '../../src/context/CommunityContext';
import { getTheme } from '../../src/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerNote: {
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  plansList: {
    gap: 12,
  },
  createButton: {
    borderWidth: 2,
    borderColor: '#333333',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4a574',
  },
  analogKitSection: {
    marginBottom: 24,
  },
  kitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 12,
  },
  kitItemsContainer: {
    gap: 8,
  },
  kitItem: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kitItemLabel: {
    fontSize: 13,
    color: '#e5e5e5',
    fontWeight: '500',
  },
  kitItemAction: {
    fontSize: 11,
    color: '#d4a574',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: '#808080',
    textAlign: 'center',
    paddingVertical: 32,
  },
});

const ANALOG_KIT_ITEMS = [
  'Signal Cards',
  'Frequency Chart',
  'Communication Tree',
  'Resource Map',
];

export default function PlansScreen() {
  const { mode } = useApp();
  const { plans } = useCommunity();
  const theme = getTheme(mode);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const handleTogglePlan = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Plans</Text>
          <Text style={styles.headerNote}>
            All plans stored locally for offline access
          </Text>
        </View>

        {/* Create New Plan Button */}
        <Pressable style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create New Plan</Text>
        </Pressable>

        {/* Plans List */}
        <View style={styles.section}>
          {plans.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={plans}
              keyExtractor={(item) => item.id}
              renderItem={({ item: plan }) => (
                <Pressable
                  onPress={() => handleTogglePlan(plan.id)}
                >
                  <PlanCard
                    plan={plan}
                    isExpanded={expandedPlanId === plan.id}
                    theme={theme}
                  />
                </Pressable>
              )}
              contentContainerStyle={styles.plansList}
              ItemSeparatorComponent={() => null}
            />
          ) : (
            <Text style={styles.emptyText}>No plans created yet</Text>
          )}
        </View>

        {/* Analog Kit Section */}
        <View style={styles.analogKitSection}>
          <Text style={styles.kitTitle}>Printable Analog Kit</Text>
          <View style={styles.kitItemsContainer}>
            {ANALOG_KIT_ITEMS.map((item) => (
              <View key={item} style={styles.kitItem}>
                <Text style={styles.kitItemLabel}>{item}</Text>
                <Pressable>
                  <Text style={styles.kitItemAction}>Print</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
