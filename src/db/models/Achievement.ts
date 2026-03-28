import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';

export default class Achievement extends Model {
  static table = 'achievements';

  static associations = {
    member: { type: 'belongs_to', key: 'member_id' },
  };

  @readonly @text('member_id') memberId!: string;

  @text('name') name!: string;

  @text('description') description!: string;

  @text('icon') icon!: string;

  @field('earned') earned!: boolean;

  @field('earned_at') earnedAt!: number;

  @relation('member', 'member_id') member!: any;
}
