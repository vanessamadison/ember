import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  relation,
  children,
  readonly,
} from '@nozbe/watermelondb/decorators';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface Resource {
  name: string;
  quantity: number;
  unit: string;
}

export default class Member extends Model {
  static table = 'members';

  static associations = {
    community: { type: 'belongs_to', key: 'community_id' },
    check_ins: { type: 'has_many', foreignKey: 'member_id' },
    achievements: { type: 'has_many', foreignKey: 'member_id' },
  } as const;

  @text('name') name!: string;

  @text('role') role!: string;

  @text('avatar') avatar!: string;

  @text('bio') bio!: string;

  @text('status') status!: 'safe' | 'help' | 'unknown';

  @field('last_check_in') lastCheckIn!: number;

  @text('skills_json') skillsJson!: string;

  @text('resources_json') resourcesJson!: string;

  @field('is_self') isSelf!: boolean;

  @text('public_id') publicId?: string;

  @field('removed_at') removedAt?: number;

  @readonly @text('community_id') communityId!: string;

  @relation('community', 'community_id') community!: any;

  @children('check_ins') checkIns!: any;

  @children('achievements') achievements!: any;

  get parsedSkills(): Skill[] {
    try {
      return JSON.parse(this.skillsJson || '[]');
    } catch {
      return [];
    }
  }

  get parsedResources(): Resource[] {
    try {
      return JSON.parse(this.resourcesJson || '[]');
    } catch {
      return [];
    }
  }
}
