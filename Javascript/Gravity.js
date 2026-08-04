import { Position } from './Primitives.js';

const EARTH_CENTER = new Position(0, -6371e3);
const EARTH_MASS = 5.97219e24;
const GRAVITY_FIELD_CONSTANT = 6.67e-11;

export { EARTH_CENTER, EARTH_MASS, GRAVITY_FIELD_CONSTANT };
