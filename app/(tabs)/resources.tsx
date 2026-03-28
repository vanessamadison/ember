import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceBar, Modal, SectionHeader } from '../../src/components';
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
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryBadge: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#a3a3a3',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  resourceItem: {
    marginBottom: 12,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e5e5e5',
  },
  emptyText: {
    fontSize: 13,
    color: '#808080',
    textAlign: 'center',
    paddingVertical: 32,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e5e5e5',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: '#d4a574',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  cancelButton: {
    backgroundColor: '#333333',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e5e5',
  },
});

const CATEGORIES = ['Water', 'Food', 'Medical', 'Power', 'Comms'];

type ResourceCategory = 'Water' | 'Food' | 'Medical' | 'Power' | 'Comms';

export default function ResourcesScreen() {
  const { mode } = useApp();
  const { resources, updateResource } = useCommunity();
  const theme = getTheme(mode);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('1');

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  const groupedResources = useMemo(() => {
    const groups: Record<ResourceCategory, typeof resources> = {
      Water: [],
      Food: [],
      Medical: [],
      Power: [],
      Comms: [],
    };

    resources.forEach((resource) => {
      const category = resource.category as ResourceCategory;
      if (category in groups) {
        groups[category].push(resource);
      }
    });

    return groups;
  }, [resources]);

  const criticalCount = useMemo(() => {
    return resources.filter((r) => r.stock < r.target).length;
  }, [resources]);

  const healthPercent = useMemo(() => {
    if (resources.length === 0) return 100;
    const healthy = resources.filter((r) => r.stock >= r.target).length;
    return Math.round((healthy / resources.length) * 100);
  }, [resources]);

  const handleOpenModal = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setQuantity('1');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedResourceId(null);
  };

  const handleUseResource = () => {
    if (selectedResource && quantity.trim()) {
      const amount = parseInt(quantity, 10);
      if (!isNaN(amount) && amount > 0) {
        updateResource(selectedResource.id, selectedResource.stock - amount);
        handleCloseModal();
      }
    }
  };

  const handleAddResource = () => {
    if (selectedResource && quantity.trim()) {
      const amount = parseInt(quantity, 10);
      if (!isNaN(amount) && amount > 0) {
        updateResource(selectedResource.id, selectedResource.stock + amount);
        handleCloseModal();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Supply</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryLabel}>Tracked</Text>
              <Text style={styles.summaryValue}>{resources.length}</Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryLabel}>Critical</Text>
              <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                {criticalCount}
              </Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryLabel}>Health</Text>
              <Text style={[styles.summaryValue, { color: theme.accent }]}>
                {healthPercent}%
              </Text>
            </View>
          </View>
        </View>

        {resources.length > 0 ? (
          <>
            {CATEGORIES.map((category) => {
              const categoryResources = groupedResources[category as ResourceCategory];
              if (categoryResources.length === 0) return null;

              return (
                <View key={category} style={styles.section}>
                  <SectionHeader title={category} count={categoryResources.length} />
                  {categoryResources.map((resource) => (
                    <Pressable
                      key={resource.id}
                      onPress={() => handleOpenModal(resource.id)}
                      style={styles.resourceItem}
                    >
                      <ResourceBar resource={resource} theme={theme} />
                    </Pressable>
                  ))}
                </View>
              );
            })}

            <View style={styles.actionsSection}>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Full Audit</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Export CSV</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Gap Report</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Request</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No resources tracked yet</Text>
        )}
      </ScrollView>

      <Modal visible={modalVisible} onClose={handleCloseModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedResource?.name}
          </Text>

          <Text style={styles.label}>Current Stock</Text>
          <View
            style={{
              backgroundColor: '#0f0f0f',
              borderWidth: 1,
              borderColor: '#333333',
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 13 }}>
              {selectedResource?.stock} {selectedResource?.unit}
            </Text>
          </View>

          <Text style={styles.label}>Target Stock</Text>
          <View
            style={{
              backgroundColor: '#0f0f0f',
              borderWidth: 1,
              borderColor: '#333333',
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 13 }}>
              {selectedResource?.target} {selectedResource?.unit}
            </Text>
          </View>

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter quantity"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleAddResource}
            >
              <Text style={styles.primaryButtonText}>+ Add</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleUseResource}
            >
              <Text style={styles.primaryButtonText}>- Use</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleCloseModal}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
