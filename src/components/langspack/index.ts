import type { Plugin } from 'vite';
import type { LangspackOpt, LangOpt } from '#/plugin';
import { basename, dirname, resolve } from 'path';
import { dir2files, file2content, file2obj, obj2file, unlink } from '../../api/fsUtil';
import * as Log from './log';
import { createWatch } from './watch';

const genTmpJsUri = (path: string) => basename(path) + '.tmp.js';
const genJsonUri = (path: string) => '/' + basename(path);
const TmpLocalCode = '\
const getData = async () => Promise.resolve(XXX_DATA);\
export default getData().then((d) => d);\
';
const TmpRemoteCode = "\
import axios from 'axios';\
const getData = async (uri) => {\
  const msgs = await axios.get(uri);\
  return msgs.data;\
};\
export default getData('XXX_URI').then((d) => d);\
";
let localData: any = {};

function collectData(langs: LangOpt[], mode: string) {
  const data: any = {};
  for (const lang of langs) {
    const files = dir2files({ dir: lang.src, ...lang });
    const fdata = files.map((f) => ({ path: f.slice(lang.src.length), data: JSON.parse(file2content(f)) }));
    data[lang.name] = {};
    for (const f of fdata) file2obj(f, data[lang.name]);
    if (mode !== 'development') obj2file(lang.dst, data[lang.name]);
  }
  Log.debug('update localData ', JSON.stringify(data));
  return data;
}

export default function langspack(opt: LangspackOpt): Plugin {
  const { langs, logLevel = 4, mode = 'build', rootDir } = opt;
  const langOpts = langs.map((l) => ({ ...l, name: basename(l.dst) }));
  Log.setLevel(logLevel);
  return {
    name: 'vite-plugin-langspack',
    enforce: 'pre',
    buildStart() {
      Log.debug('vite-plugin-langspack started, opt %s', JSON.stringify(opt));
      localData = collectData(langOpts, mode);
      createWatch(opt, () => (localData = collectData(langOpts, mode)));
    },
    closeBundle() {
      if (mode !== 'development') for (const lang of langOpts) unlink(lang.dst);
      Log.debug('vite-plugin-langspack end');
    },
    resolveId(source, importer) {
      if (source.charAt(0) === '/') source = rootDir + source;
      const srcpath = resolve(process.cwd(), dirname(importer ?? '.'), source);
      for (const lang of langOpts) {
        if (srcpath.includes(lang.src)) {
          Log.info('replace %s -> %s', source, genTmpJsUri(lang.dst));
          return { id: genTmpJsUri(lang.dst) };
        }
      }
      Log.debug('source %s, path %s, importer %s', source, srcpath, importer);
      return null;
    },
    load(id) {
      for (const lang of langOpts) {
        if (id === genTmpJsUri(lang.dst)) {
          return mode === 'development' ? TmpLocalCode.replace('XXX_DATA', JSON.stringify(localData[lang.name])) : TmpRemoteCode.replace('XXX_URI', genJsonUri(lang.dst));
        }
      }
      return null;
    },
  };
}
