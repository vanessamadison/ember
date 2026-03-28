export enum STATUS {
  SAFE = 'safe',
  HELP = 'help',
  UNKNOWN = 'unknown',
}

export enum RESOURCE_CATEGORY {
  WATER = 'water',
  FOOD = 'food',
  MEDICAL = 'medical',
  POWER = 'power',
  COMMS = 'comms',
}

export interface ResourceCategoryDef {
  id: RESOURCE_CATEGORY;
  label: string;
  icon: string;
  description: string;
}

export const RESOURCE_CATEGORIES: Record<RESOURCE_CATEGORY, ResourceCategoryDef> = {
  [RESOURCE_CATEGORY.WATER]: {
    id: RESOURCE_CATEGORY.WATER,
    label: 'Water',
    icon: 'droplet',
    description: 'Potable water and water purification supplies',
  },
  [RESOURCE_CATEGORY.FOOD]: {
    id: RESOURCE_CATEGORY.FOOD,
    label: 'Food',
    icon: 'apple',
    description: 'Non-perishable food and nutrition supplies',
  },
  [RESOURCE_CATEGORY.MEDICAL]: {
    id: RESOURCE_CATEGORY.MEDICAL,
    label: 'Medical',
    icon: 'heart',
    description: 'First aid kits, medications, and medical equipment',
  },
  [RESOURCE_CATEGORY.POWER]: {
    id: RESOURCE_CATEGORY.POWER,
    label: 'Power',
    icon: 'zap',
    description: 'Batteries, generators, and power sources',
  },
  [RESOURCE_CATEGORY.COMMS]: {
    id: RESOURCE_CATEGORY.COMMS,
    label: 'Comms',
    icon: 'radio',
    description: 'Communication equipment and backup systems',
  },
};

export enum DRILL_DIFFICULTY {
  EASY = 'easy',
  MEDIUM = 'med',
  HARD = 'hard',
}

export interface DrillDifficultyDef {
  id: DRILL_DIFFICULTY;
  label: string;
  xpReward: number;
  durationMinutes: number;
}

export const DRILL_DIFFICULTIES: Record<DRILL_DIFFICULTY, DrillDifficultyDef> = {
  [DRILL_DIFFICULTY.EASY]: {
    id: DRILL_DIFFICULTY.EASY,
    label: 'Easy',
    xpReward: 25,
    durationMinutes: 5,
  },
  [DRILL_DIFFICULTY.MEDIUM]: {
    id: DRILL_DIFFICULTY.MEDIUM,
    label: 'Medium',
    xpReward: 50,
    durationMinutes: 15,
  },
  [DRILL_DIFFICULTY.HARD]: {
    id: DRILL_DIFFICULTY.HARD,
    label: 'Hard',
    xpReward: 100,
    durationMinutes: 30,
  },
};

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_checkin',
    name: 'First Contact',
    description: 'Complete your first check-in',
    icon: 'target',
    criteria: 'checkIn:1',
    xpReward: 10,
    rarity: 'common',
  },
  {
    id: 'first_resource',
    name: 'Curator',
    description: 'Log your first resource',
    icon: 'package',
    criteria: 'resource:1',
    xpReward: 15,
    rarity: 'common',
  },
  {
    id: 'first_drill',
    name: 'Prepared',
    description: 'Complete your first drill',
    icon: 'book',
    criteria: 'drill:1',
    xpReward: 20,
    rarity: 'common',
  },
  {
    id: 'week_streak',
    name: 'Consistent',
    description: 'Maintain a 7-day check-in streak',
    icon: 'flame',
    criteria: 'streak:7',
    xpReward: 50,
    rarity: 'uncommon',
  },
  {
    id: 'month_streak',
    name: 'Dedicated',
    description: 'Maintain a 30-day check-in streak',
    icon: 'flame',
    criteria: 'streak:30',
    xpReward: 150,
    rarity: 'rare',
  },
  {
    id: 'all_drills',
    name: 'Drilled',
    description: 'Complete drills in all difficulty levels',
    icon: 'award',
    criteria: 'drill_variety:3',
    xpReward: 75,
    rarity: 'uncommon',
  },
  {
    id: 'resource_diversity',
    name: 'Well-Stocked',
    description: 'Log resources from all categories',
    icon: 'layers',
    criteria: 'resource_categories:5',
    xpReward: 100,
    rarity: 'rare',
  },
  {
    id: 'community_champion',
    name: 'Champion',
    description: 'Help 10 community members',
    icon: 'heart-handshake',
    criteria: 'help_count:10',
    xpReward: 200,
    rarity: 'epic',
  },
  {
    id: 'resilience_master',
    name: 'Resilience Master',
    description: 'Achieve readiness score of 90%',
    icon: 'shield-check',
    criteria: 'readiness:90',
    xpReward: 250,
    rarity: 'legendary',
  },
];

export interface XPLevel {
  level: number;
  requiredXp: number;
  label: string;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1, requiredXp: 0, label: 'Aware' },
  { level: 2, requiredXp: 100, label: 'Informed' },
  { level: 3, requiredXp: 250, label: 'Prepared' },
  { level: 4, requiredXp: 450, label: 'Ready' },
  { level: 5, requiredXp: 700, label: 'Resilient' },
  { level: 6, requiredXp: 1000, label: 'Guardian' },
  { level: 7, requiredXp: 1350, label: 'Leader' },
  { level: 8, requiredXp: 1750, label: 'Sentinel' },
  { level: 9, requiredXp: 2200, label: 'Champion' },
  { level: 10, requiredXp: 2700, label: 'Protector' },
];

export const APP_NAME = 'EMBER';
export const APP_VERSION = '1.0.0';
export const LICENSE = 'MIT';

export interface MeshConfig {
  maxPayloadBytes: number;
  defaultChannel: string;
  region: string;
}

export const MESH_CONFIG: MeshConfig = {
  maxPayloadBytes: 237,
  defaultChannel: 'community',
  region: 'global',
};

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  iterationCount: number;
  saltLength: number;
}

export const ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'AES-256-GCM',
  keySize: 32,
  iterationCount: 100000,
  saltLength: 16,
};
