import type { Activity } from '../../content/types';

export interface ActivityProps<T extends Activity['type']> {
  activity: Extract<Activity, { type: T }>;
  /** Called once, when the child has finished the whole activity. */
  onDone: () => void;
}
