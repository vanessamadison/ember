import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';

export default class Drill extends Model {
  static table = 'drills';

  static associations = {
    community: { type: 'belongs_to', key: 'community_id' },
  };

  @readonly @text('community_id') communityId!: string;

  @text('name') name!: string;

  @text('description') description!: string;

  @text('difficulty') difficulty!: 'easy' | 'medium' | 'hard';

  @field('estimated_time') estimatedTime!: number;

  @text('icon') icon!: string;

  @field('xp_reward') xpReward!: number;

  @field('is_completed') isCompleted!: boolean;

  @field('score') score!: number;

  @field('completed_at') completedAt!: number;

  @relation('community', 'community_id') community!: any;
}
