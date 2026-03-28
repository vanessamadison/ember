import { useEffect, useState, useCallback, useMemo } from 'react';
import { RESOURCE_CATEGORY } from '../constants';

export interface Resource {
  id: string;
  communityId: string;
  category: RESOURCE_CATEGORY;
  name: string;
  quantity: number;
  unit: string;
  lastUpdated: number;
  owner?: string;
  critical?: boolean;
}

export interface ResourcesByCategory {
  [key: string]: Resource[];
}

export interface UseResourcesResult {
  resources: Resource[];
  byCategory: ResourcesByCategory;
  criticalItems: Resource[];
  resHealth: number;
  loading: boolean;
  error: Error | null;
  updateQuantity: (resourceId: string, quantity: number) => Promise<void>;
  addResource: (
    resource: Omit<Resource, 'id' | 'lastUpdated'>
  ) => Promise<Resource>;
  removeResource: (resourceId: string) => Promise<void>;
}

export function useResources(communityId: string): UseResourcesResult {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Mock data for initialization
  const mockResources: Resource[] = [
    {
      id: 'res_1',
      communityId,
      category: RESOURCE_CATEGORY.WATER,
      name: 'Bottled Water',
      quantity: 24,
      unit: 'bottles',
      lastUpdated: Date.now() - 3600000,
      owner: 'member_1',
    },
    {
      id: 'res_2',
      communityId,
      category: RESOURCE_CATEGORY.FOOD,
      name: 'Canned Food',
      quantity: 3,
      unit: 'cases',
      lastUpdated: Date.now() - 7200000,
      owner: 'member_2',
      critical: true,
    },
    {
      id: 'res_3',
      communityId,
      category: RESOURCE_CATEGORY.MEDICAL,
      name: 'First Aid Kits',
      quantity: 8,
      unit: 'kits',
      lastUpdated: Date.now() - 1800000,
      owner: 'member_1',
    },
    {
      id: 'res_4',
      communityId,
      category: RESOURCE_CATEGORY.POWER,
      name: 'Battery Packs',
      quantity: 2,
      unit: 'packs',
      lastUpdated: Date.now() - 86400000,
      owner: 'member_3',
      critical: true,
    },
    {
      id: 'res_5',
      communityId,
      category: RESOURCE_CATEGORY.COMMS,
      name: 'Radios',
      quantity: 6,
      unit: 'units',
      lastUpdated: Date.now() - 172800000,
      owner: 'member_2',
    },
  ];

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        // Simulate async database fetch
        await new Promise((resolve) => setTimeout(resolve, 500));
        setResources(mockResources);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load resources')
        );
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [communityId]);

  const updateQuantity = useCallback(
    async (resourceId: string, quantity: number): Promise<void> => {
      setResources((prevResources) =>
        prevResources.map((r) =>
          r.id === resourceId
            ? {
                ...r,
                quantity,
                lastUpdated: Date.now(),
                critical: quantity < 5,
              }
            : r
        )
      );
    },
    []
  );

  const addResource = useCallback(
    async (
      resource: Omit<Resource, 'id' | 'lastUpdated'>
    ): Promise<Resource> => {
      const newResource: Resource = {
        ...resource,
        id: `res_${Date.now()}`,
        lastUpdated: Date.now(),
        critical: resource.quantity < 5,
      };
      setResources((prevResources) => [...prevResources, newResource]);
      return newResource;
    },
    []
  );

  const removeResource = useCallback(
    async (resourceId: string): Promise<void> => {
      setResources((prevResources) =>
        prevResources.filter((r) => r.id !== resourceId)
      );
    },
    []
  );

  const byCategory = useMemo<ResourcesByCategory>(() => {
    const grouped: ResourcesByCategory = {};
    resources.forEach((resource) => {
      if (!grouped[resource.category]) {
        grouped[resource.category] = [];
      }
      grouped[resource.category].push(resource);
    });
    return grouped;
  }, [resources]);

  const criticalItems = useMemo<Resource[]>(
    () => resources.filter((r) => r.quantity < 5),
    [resources]
  );

  const resHealth = useMemo<number>(() => {
    if (resources.length === 0) return 0;
    const healthyCount = resources.filter((r) => r.quantity >= 5).length;
    return Math.round((healthyCount / resources.length) * 100);
  }, [resources]);

  return {
    resources,
    byCategory,
    criticalItems,
    resHealth,
    loading,
    error,
    updateQuantity,
    addResource,
    removeResource,
  };
}
