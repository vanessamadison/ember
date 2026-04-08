import { Model } from '@nozbe/watermelondb';
import {
  field,
  text,
  date,
  relation,
  readonly,
} from '@nozbe/watermelondb/decorators';

export default class Message extends Model {
  static table = 'messages';

  static associations = {
    community: { type: 'belongs_to', key: 'community_id' },
  } as const;

  @readonly @text('community_id') communityId!: string;

  @text('sender_id') senderId!: string;

  @text('sender_name') senderName!: string;

  @text('text_encrypted') textEncrypted!: string;

  @text('message_type') messageType!: 'system' | 'resource' | 'broadcast' | 'social';

  @field('timestamp') timestamp!: number;

  @field('is_mesh') isMesh!: boolean;

  @field('delivered') delivered!: boolean;

  @text('public_id') publicId?: string;

  @readonly @date('timestamp') timestampDate!: Date;

  @relation('community', 'community_id') community!: any;
}
