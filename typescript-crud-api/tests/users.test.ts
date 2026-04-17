import assert from 'node:assert/strict';
import { Role } from '../src/_helpers/role';
import usersController from '../src/_users/users.controller';

assert.equal(Role.Admin, 'Admin');
assert.equal(Role.User, 'User');
assert.equal(typeof usersController.stack, 'object');

console.log('Smoke tests passed');