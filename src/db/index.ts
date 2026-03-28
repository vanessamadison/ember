import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './schema';
import {
  Community,
  Member,
  Resource,
  CheckIn,
  Drill,
  EmergencyPlan,
  Message,
  Achievement,
} from './models';

const isNative = typeof navigator === 'undefined' || !navigator.userAgent.includes('Mozilla');

let adapter: any;

if (isNative) {
  // Native platform (React Native/Expo)
  adapter = new SQLiteAdapter({
    schema,
    dbName: 'ember.db',
    jsi: undefined,
    onSetUpError: (error) => {
      console.error('Database setup error:', error);
    },
  });
} else {
  // Web platform
  adapter = new LokiJSAdapter({
    schema,
    dbName: 'ember_web',
    onSetUpError: (error) => {
      console.error('Database setup error:', error);
    },
  });
}

export const database = new Database({
  adapter,
  modelClasses: [
    Community,
    Member,
    Resource,
    CheckIn,
    Drill,
    EmergencyPlan,
    Message,
    Achievement,
  ],
});

export async function resetDatabase(): Promise<void> {
  try {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

export default database;
