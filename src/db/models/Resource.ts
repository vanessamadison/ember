import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';

export default class Resource extends Model {
  static table = 'resources';

  static associations = {
    community: { type: 'belongs_to', key: 'community_id' },
  };

  @readonly @text('community_id') communityId!: string;

  @text('category') category!: 'Water' | 'Food' | 'Medical' | 'Power' | 'Comms';

  @text('name') name!: string;

  @field('quantity') quantity!: number;

  @text('unit') unit!: string;

  @field('critical_threshold') criticalThreshold!: number;

  @field('max_capacity') maxCapacity!: number;

  @text('icon') icon!: string;

  @field('last_updated') lastUpdated!: number;

  @text('updated_by') updatedBy!: string;

  @relation('community', 'community_id') community!: any;

  get isLow(): boolean {
    return this.quantity <= this.criticalThreshold;
  }
}
