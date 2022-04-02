import type { Plugin } from 'vite';
import type { LangspackOpt } from '#/plugin';
import { dir2files, file2content, file2obj, obj2file } from './fsUtil';

export default function langspack(opts: LangspackOpt[]): Plugin {
  return {
    name: 'vite-plugin-langspack',
    apply: 'build',
    buildStart() {
      for (const opt of opts) {
        const files = dir2files({ dir: opt.src, ...opts });
        const data = files.map((f) => ({ path: f.slice(opt.src.length), data: JSON.parse(file2content(f)) }));
        const monofile = {};
        obj2file('/tmp/data.txt', data);
        for (const f of data) file2obj(f, monofile);
        obj2file(opt.dst, monofile);
      }
    },
  };
}
