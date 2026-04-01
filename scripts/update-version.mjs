/**
 * Updates APP_VERSION in angular.json with a timestamped version.
 * Runs automatically via npm's prebuild/preserve lifecycle hooks.
 *
 * Format: YYYY.MM.DD-HH:mm
 * Example: 2026.04.01-14:30
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const angularJsonPath = resolve(__dirname, '..', 'angular.json');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');

const version = [
  now.getFullYear(),
  '.', pad(now.getMonth() + 1),
  '.', pad(now.getDate()),
  '-',
  pad(now.getHours()),
  ':', pad(now.getMinutes()),
].join('');

const angularJson = JSON.parse(readFileSync(angularJsonPath, 'utf-8'));
angularJson.projects['daily-personal-cashflow'].architect.build.options.define.APP_VERSION = `"${version}"`;

writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2) + '\n');

console.log(`Updated APP_VERSION to ${version}`);
