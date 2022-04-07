import type { LangspackOpt } from '#/plugin';
import chokidar from 'chokidar';
import * as Log from './log';

function createWatch(opt: LangspackOpt, handler: (_file: string) => void) {
  const { langs, mode } = opt;
  const watchDir = langs.map((l) => l.src);
  if (mode !== 'development' || !watchDir.length) return;

  const watcher = chokidar.watch(watchDir, { ignoreInitial: true });
  watcher.on('all', async (event, file) => {
    Log.info(`file ${event}`, file);
    handler(file);
  });
}

export { createWatch };
