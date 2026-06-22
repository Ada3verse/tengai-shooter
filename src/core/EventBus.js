import Phaser from 'phaser';

// Shared pub/sub channel for cross-scene signals (GameScene <-> UIScene, etc).
// Plain EventEmitter, independent of any single Scene's lifecycle.
const EventBus = new Phaser.Events.EventEmitter();

export default EventBus;
