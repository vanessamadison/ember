/** Jest shim: native BLE not available in Node. */
class BleManager {
  constructor() {
    this._subs = [];
  }
  onStateChange(listener) {
    listener('PoweredOn');
    const sub = { remove: () => {} };
    this._subs.push(sub);
    return sub;
  }
  async state() {
    return 'PoweredOn';
  }
  startDeviceScan() {}
  stopDeviceScan() {}
  destroy() {}
}

module.exports = {
  BleManager,
  State: {
    Unknown: 'Unknown',
    Resetting: 'Resetting',
    Unsupported: 'Unsupported',
    Unauthorized: 'Unauthorized',
    PoweredOff: 'PoweredOff',
    PoweredOn: 'PoweredOn',
  },
};
