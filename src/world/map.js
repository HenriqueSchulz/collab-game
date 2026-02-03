import { room } from './room.js';
import { corridorH, corridorV } from './corridor.js';
import { ROOM_SIZE, WALL_THICKNESS, CORRIDOR_LENGTH } from './constants.js';

export function buildMap(scene) {
  const OFFSET =
    ROOM_SIZE / 2 +
    WALL_THICKNESS / 2 +
    CORRIDOR_LENGTH / 2;

  room(scene, -OFFSET, -OFFSET, ['e', 's']);
  room(scene,  OFFSET, -OFFSET, ['w', 's']);
  room(scene, -OFFSET,  OFFSET, ['e', 'n']);
  room(scene,  OFFSET,  OFFSET, ['w', 'n']);

  corridorH(scene, 0, -OFFSET);
  corridorH(scene, 0,  OFFSET);
  corridorV(scene, -OFFSET, 0);
  corridorV(scene,  OFFSET, 0);
}
