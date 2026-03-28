import { useEffect, useState, useCallback } from 'react';
import { STATUS } from '../constants';

export interface Member {
  id: string;
  communityId: string;
  name: string;
  status: STATUS;
  lastCheckIn: number;
  xp: number;
  level: number;
  avatar?: string;
}

export interface UseMembersResult {
  members: Member[];
  safeCount: number;
  helpCount: number;
  unknownCount: number;
  loading: boolean;
  error: Error | null;
  checkIn: (memberId: string, status: STATUS) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<Member>) => Promise<void>;
  addMember: (member: Omit<Member, 'id'>) => Promise<Member>;
}

export function useMembers(communityId: string): UseMembersResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Mock data for initialization
  const mockMembers: Member[] = [
    {
      id: 'member_1',
      communityId,
      name: 'Alice Johnson',
      status: STATUS.SAFE,
      lastCheckIn: Date.now() - 3600000,
      xp: 250,
      level: 3,
      avatar: 'AJ',
    },
    {
      id: 'member_2',
      communityId,
      name: 'Bob Smith',
      status: STATUS.HELP,
      lastCheckIn: Date.now() - 7200000,
      xp: 150,
      level: 2,
      avatar: 'BS',
    },
    {
      id: 'member_3',
      communityId,
      name: 'Carol Williams',
      status: STATUS.UNKNOWN,
      lastCheckIn: Date.now() - 86400000,
      xp: 75,
      level: 1,
      avatar: 'CW',
    },
  ];

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        // Simulate async database fetch
        await new Promise((resolve) => setTimeout(resolve, 500));
        setMembers(mockMembers);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to load members')
        );
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [communityId]);

  const checkIn = useCallback(
    async (memberId: string, status: STATUS): Promise<void> => {
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status,
                lastCheckIn: Date.now(),
              }
            : m
        )
      );
    },
    []
  );

  const updateMember = useCallback(
    async (
      memberId: string,
      updates: Partial<Member>
    ): Promise<void> => {
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.id === memberId ? { ...m, ...updates } : m
        )
      );
    },
    []
  );

  const addMember = useCallback(
    async (member: Omit<Member, 'id'>): Promise<Member> => {
      const newMember: Member = {
        ...member,
        id: `member_${Date.now()}`,
      };
      setMembers((prevMembers) => [...prevMembers, newMember]);
      return newMember;
    },
    []
  );

  const safeCount = members.filter((m) => m.status === STATUS.SAFE).length;
  const helpCount = members.filter((m) => m.status === STATUS.HELP).length;
  const unknownCount = members.filter((m) => m.status === STATUS.UNKNOWN)
    .length;

  return {
    members,
    safeCount,
    helpCount,
    unknownCount,
    loading,
    error,
    checkIn,
    updateMember,
    addMember,
  };
}
