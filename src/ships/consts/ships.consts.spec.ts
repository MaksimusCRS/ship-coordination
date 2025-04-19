import {
  LOOKAHEAD_TIME,
  COLLISION_DISTANCE,
  WARNING_DISTANCE,
} from './ships.consts';

describe('Ship Constants', () => {
  it('should have correct LOOKAHEAD_TIME', () => {
    expect(LOOKAHEAD_TIME).toBe(60);
  });

  it('should have correct COLLISION_DISTANCE', () => {
    expect(COLLISION_DISTANCE).toBe(1);
  });

  it('should have correct WARNING_DISTANCE', () => {
    expect(WARNING_DISTANCE).toBe(2);
  });

  it('should have WARNING_DISTANCE greater than COLLISION_DISTANCE', () => {
    expect(WARNING_DISTANCE).toBeGreaterThan(COLLISION_DISTANCE);
  });
});
