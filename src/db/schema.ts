import { appSchema, tableSchema } from '@nozbe/watermelondb';
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const schema = appSchema({
  version: 5,
  tables: [
    tableSchema({
      name: 'communities',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'passphrase_hash', type: 'string' },
        { name: 'invite_code', type: 'string' },
        { name: 'derivation_salt', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'member_count', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'invite_expires_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'members',
      columns: [
        { name: 'community_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'avatar', type: 'string' },
        { name: 'bio', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'last_check_in', type: 'number' },
        { name: 'skills_json', type: 'string' },
        { name: 'resources_json', type: 'string' },
        { name: 'is_self', type: 'boolean' },
        { name: 'public_id', type: 'string', isOptional: true },
        { name: 'removed_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'resources',
      columns: [
        { name: 'community_id', type: 'string', isIndexed: true },
        { name: 'category', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'unit', type: 'string' },
        { name: 'critical_threshold', type: 'number' },
        { name: 'max_capacity', type: 'number' },
        { name: 'icon', type: 'string' },
        { name: 'last_updated', type: 'number' },
        { name: 'updated_by', type: 'string' },
        { name: 'public_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'check_ins',
      columns: [
        { name: 'member_id', type: 'string', isIndexed: true },
        { name: 'community_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'location_encrypted', type: 'string' },
        { name: 'note', type: 'string' },
        { name: 'sync_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'drills',
      columns: [
        { name: 'community_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'difficulty', type: 'string' },
        { name: 'estimated_time', type: 'number' },
        { name: 'icon', type: 'string' },
        { name: 'xp_reward', type: 'number' },
        { name: 'is_completed', type: 'boolean' },
        { name: 'score', type: 'number' },
        { name: 'completed_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'emergency_plans',
      columns: [
        { name: 'community_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'plan_type', type: 'string' },
        { name: 'content_encrypted', type: 'string' },
        { name: 'size_bytes', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'last_updated', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'community_id', type: 'string', isIndexed: true },
        { name: 'sender_id', type: 'string' },
        { name: 'sender_name', type: 'string' },
        { name: 'text_encrypted', type: 'string' },
        { name: 'message_type', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'is_mesh', type: 'boolean' },
        { name: 'delivered', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'achievements',
      columns: [
        { name: 'member_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'earned', type: 'boolean' },
        { name: 'earned_at', type: 'number' },
      ],
    }),
  ],
});

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'communities',
          columns: [{ name: 'derivation_salt', type: 'string', isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'members',
          columns: [{ name: 'public_id', type: 'string', isOptional: true }],
        }),
        addColumns({
          table: 'check_ins',
          columns: [{ name: 'sync_id', type: 'string', isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'communities',
          columns: [{ name: 'invite_expires_at', type: 'number', isOptional: true }],
        }),
        addColumns({
          table: 'members',
          columns: [{ name: 'removed_at', type: 'number', isOptional: true }],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: 'resources',
          columns: [{ name: 'public_id', type: 'string', isOptional: true }],
        }),
      ],
    },
  ],
});
