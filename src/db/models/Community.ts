import { Model } from '@nozbe/watermelondb';
import {
  field,
  date,
  children,
  readonly,
  text,
} from '@nozbe/watermelondb/decorators';

export default class Community extends Model {
  static table = 'communities';

  static associations = {
    members: { type: 'has_many', foreignKey: 'community_id' },
    resources: { type: 'has_many', foreignKey: 'community_id' },
    drills: { type: 'has_many', foreignKey: 'community_id' },
    emergency_plans: { type: 'has_many', foreignKey: 'community_id' },
    messages: { type: 'has_many', foreignKey: 'community_id' },
  };

  @text('name') name!: string;

  @text('passphrase_hash') passphraseHash!: string;

  @text('invite_code') inviteCode!: string;

  @field('created_at') createdAt!: number;

  @field('member_count') memberCount!: number;

  @field('is_active') isActive!: boolean;

  @readonly @date('created_at') createdAtDate!: Date;

  @children('members') members!: any;

  @children('resources') resources!: any;

  @children('drills') drills!: any;

  @children('emergency_plans') emergencyPlans!: any;

  @children('messages') messages!: any;
}
