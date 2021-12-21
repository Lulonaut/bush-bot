import { dirname } from 'path';
import 'source-map-support/register.js';
import { fileURLToPath } from 'url';
import config from './config/options.js';
import { Sentry } from './lib/common/Sentry.js';
import { BushClient } from './lib/index.js';

new Sentry(dirname(fileURLToPath(import.meta.url)) || process.cwd());
BushClient.init();
void new BushClient(config).start();
