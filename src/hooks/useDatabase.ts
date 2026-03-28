import { useMemo, useCallback } from 'react';
import {
  Database,
  Collection,
  Query,
  Clause,
  QueryAssociation,
} from '@nozbe/watermelondb';
import { Subscription } from 'rxjs';

// Global database instance (would be initialized in app root)
let dbInstance: Database | null = null;

export function initializeDatabase(database: Database): void {
  dbInstance = database;
}

export function getDatabase(): Database {
  if (!dbInstance) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() in your app root.'
    );
  }
  return dbInstance;
}

interface UseQueryOptions {
  observeChanges?: boolean;
}

export function useDatabase(): Database {
  return useMemo(() => {
    return getDatabase();
  }, []);
}

export function useCollection<T>(tableName: string): Collection<T> {
  const database = useDatabase();

  return useMemo(() => {
    return database.get(tableName) as Collection<T>;
  }, [database, tableName]);
}

export function useQuery<T>(
  collection: Collection<T>,
  clauses?: Clause | Clause[],
  options: UseQueryOptions = {}
): [T[], Subscription | null] {
  const [records, setRecords] = React.useState<T[]>([]);
  const subscriptionRef = React.useRef<Subscription | null>(null);

  React.useEffect(() => {
    let query: Query<T> = collection.query();

    if (clauses) {
      const clauseArray = Array.isArray(clauses) ? clauses : [clauses];
      query = collection.query(...clauseArray);
    }

    if (options.observeChanges) {
      subscriptionRef.current = query.observe().subscribe((items) => {
        setRecords(items);
      });
    } else {
      query.fetch().then((items) => {
        setRecords(items);
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [collection, clauses, options.observeChanges]);

  return [records, subscriptionRef.current];
}

export function useQueryObserve<T>(
  collection: Collection<T>,
  clauses?: Clause | Clause[]
): T[] {
  const [records, setRecords] = React.useState<T[]>([]);

  React.useEffect(() => {
    let query: Query<T> = collection.query();

    if (clauses) {
      const clauseArray = Array.isArray(clauses) ? clauses : [clauses];
      query = collection.query(...clauseArray);
    }

    const subscription = query.observe().subscribe((items) => {
      setRecords(items);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [collection, clauses]);

  return records;
}

import React;
