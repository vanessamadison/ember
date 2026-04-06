/**
 * Meshtastic MeshBluetoothService — UUIDs from official client API docs:
 * https://meshtastic.org/docs/development/device/client-api/
 * Verify against your firmware before production use.
 */
export const MESHTASTIC_MESH_SERVICE_UUID =
  '6ba1b218-15a8-461f-9fa8-5dcae273eafd';

/** Read mailbox for FromRadio protobufs */
export const MESHTASTIC_FROM_RADIO_UUID =
  '2c55e69e-4993-11ed-b878-0242ac120002';

/** Write ToRadio protobufs */
export const MESHTASTIC_TO_RADIO_UUID =
  'f75c76d2-129e-4dad-a1dd-7866124401e7';

/** Notify when FromRadio has new data; read for backlog counter */
export const MESHTASTIC_FROM_NUM_UUID =
  'ed9da18c-a800-4f66-a670-aa7547e34453';

/** Optional debug LogRecord stream */
export const MESHTASTIC_LOG_RADIO_UUID =
  '5a3d6e49-06e6-4423-9944-e9de8cdf9547';

/** Recommended ATT MTU after connect */
export const MESHTASTIC_RECOMMENDED_MTU = 512;
