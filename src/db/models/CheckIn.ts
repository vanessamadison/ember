import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  date,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';

export default class CheckIn extends Model {
  static table = 'check_ins';

  static associations = {
    member: { type: 'belongs_to', key: 'member_id' },
  } as const;

  @readonly @text('member_id') memberId!: string;

  @readonly @text('community_id') communityId!: string;

  @text('status') status!: 'safe' | 'help' | 'unknown';

  @field('timestamp') timestamp!: number;

  @text('location_encrypted') locationEncrypted!: string;

  @text('note') note!: string;

  @text('sync_id') syncId?: string;

  @readonly @date('timestamp') timestampDate!: Date;

  @relation('member', 'member_id') member!: any;
}
