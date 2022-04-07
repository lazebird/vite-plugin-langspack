import type { Plugin } from 'vite';
import type { LangspackOpt } from '#/plugin';
import { basename, dirname, resolve } from 'path';
import { dir2files, file2content, file2obj, obj2file, unlink } from '../../api/fsUtil';
import * as Log from './log';

const genTmpJsUri = (path: string) => basename(path) + '.tmp.js';
const genJsonUri = (path: string) => '/' + basename(path);
const TmpLocalCode = 'export default XXX_DATA;';
const TmpRemoteCode = "\
import axios from 'axios';\
const getData = async (uri) => {\
  const msgs = await axios.get(uri);\
  Log.debug(msgs.data);\
  return msgs.data;\
};\
export default getData('XXX_URI').then((d) => d);\
";
export default function langspack(opts: LangspackOpt): Plugin {
  const { langs, logLevel = 4, mode } = opts;
  const langOpts = langs.map((l) => ({ name: basename(l.dst), ...l }));
  const localData: any = {};
  Log.setLevel(logLevel);
  return {
    name: 'vite-plugin-langspack',
    enforce: 'pre',
    buildStart() {
      Log.debug('vite-plugin-langspack started, opts %s', JSON.stringify(opts));
      for (const opt of langOpts) {
        const files = dir2files({ dir: opt.src, ...opt });
        const data = files.map((f) => ({ path: f.slice(opt.src.length), data: JSON.parse(file2content(f)) }));
        localData[opt.name] = {};
        for (const f of data) file2obj(f, localData[opt.name]);
        if (mode !== 'development') obj2file(opt.dst, localData[opt.name]);
      }
    },
    closeBundle() {
      for (const opt of langOpts) unlink(opt.dst);
      Log.debug('vite-plugin-langspack end');
    },
    resolveId(source, importer) {
      const srcpath = resolve(process.cwd(), dirname(importer ?? '.'), source);
      for (const opt of langOpts) {
        if (srcpath.includes(opt.src)) {
          Log.info('replace %s -> %s', source, genTmpJsUri(opt.dst));
          return { id: genTmpJsUri(opt.dst) };
        }
      }
      Log.debug('source %s ', source);
      return null;
    },
    load(id) {
      for (const opt of langOpts) {
        if (id === genTmpJsUri(opt.dst)) {
          return mode === 'development' ? TmpLocalCode.replace('XXX_DATA', JSON.stringify(localData[opt.name], null, 2)) : TmpRemoteCode.replace('XXX_URI', genJsonUri(opt.dst));
        }
      }
      return null;
    },
  };
}
