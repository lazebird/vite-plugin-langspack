import type { Plugin } from 'vite';
import type { LangspackOpt } from '#/plugin';
import { basename, dirname, resolve } from 'path';
import { dir2files, file2content, file2obj, obj2file, unlink } from '../../api/fsUtil';

const genTmpJsUri = (path: string) => basename(path) + '.tmp.js';
const genJsonUri = (path: string) => '/' + basename(path);
const TmpCode = "\
import axios from 'axios';\
const getData = async (uri) => {\
  const msgs = await axios.get(uri);\
  console.log(msgs.data);\
  return msgs.data;\
};\
export default getData('XXX_URI').then((d) => d);\
";
export default function langspack(opts: LangspackOpt[]): Plugin {
  return {
    name: 'vite-plugin-langspack',
    enforce: 'pre',
    apply: 'build',
    buildStart() {
      //   console.log('vite-plugin-langspack started, opts %s', JSON.stringify(opts));
      for (const opt of opts) {
        const files = dir2files({ dir: opt.src, ...opt });
        const data = files.map((f) => ({ path: f.slice(opt.src.length), data: JSON.parse(file2content(f)) }));
        const monofile = {};
        obj2file('/tmp/data.txt', data);
        for (const f of data) file2obj(f, monofile);
        obj2file(opt.dst, monofile);
      }
    },
    closeBundle() {
      for (const opt of opts) unlink(opt.dst);
      //   console.log('vite-plugin-langspack end');
    },
    resolveId(source, importer) {
      const srcpath = resolve(process.cwd(), dirname(importer ?? '.'), source);
      for (const opt of opts) {
        if (srcpath.includes(opt.src)) {
          console.log('replace %s -> %s', source, genTmpJsUri(opt.dst));
          return { id: genTmpJsUri(opt.dst) }; //, external: 'relative'
        }
      }
      //   console.log('\nsource %s ', source);
      return null;
    },
    load(id) {
      for (const opt of opts) {
        if (id === genTmpJsUri(opt.dst)) {
          return TmpCode.replace('XXX_URI', genJsonUri(opt.dst));
        }
      }
    },
  };
}
