import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';

export default class EmergencyPlan extends Model {
  static table = 'emergency_plans';

  static associations = {
    community: { type: 'belongs_to', key: 'community_id' },
  } as const;

  @readonly @text('community_id') communityId!: string;

  @text('name') name!: string;

  @text('plan_type') planType!: string;

  @text('content_encrypted') contentEncrypted!: string;

  @field('size_bytes') sizeBytes!: number;

  @text('status') status!: 'current' | 'needs_review';

  @field('last_updated') lastUpdated!: number;

  @text('public_id') publicId?: string;

  @relation('community', 'community_id') community!: any;
}
