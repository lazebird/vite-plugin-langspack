import type { Plugin, ViteDevServer } from 'vite';
import type { LangspackOpt, LangOpt } from '#/plugin';
import { dir2files, file2content, file2obj, getSubdirs, obj2file, unlink } from '../../api/fsUtil';
import * as Log from './log';
import { basename } from 'path';

const TmpLocalCode = '\
const localData = XXX_DATA;\
const getData = async (locale) => Promise.resolve(localData[locale] ?? {});\
export default getData;\
';
const TmpRemoteCode = "\
import axios from 'axios';\
const getData = async (locale) => (await axios.get(`/${locale}.json`)).data;\
export default getData;\
";
let pluginOpt: LangspackOpt;
let localData: any = {};
let outputFiles: string[] = [];
let server: ViteDevServer;
const virtualModuleId = 'virtual:langs';
const resolveVirtualModuleId = '\0 @lazebird/vite-plugin-langspack/virtual:langs';

function collectData(lang: LangOpt, mode: string) {
  const data: any = {};
  const subdirs = getSubdirs(lang.src);
  Log.info('subdirs ', JSON.stringify(subdirs));
  for (const dir of subdirs) {
    const name = basename(dir);
    const files = dir2files({ dir, ...lang });
    const fdata = files.map((f) => ({ path: f.slice(lang.src.length), data: JSON.parse(file2content(f)) }));
    data[name] = {};
    for (const f of fdata) file2obj(f, data);
    if (mode !== 'development') {
      obj2file(`${lang.dst}/${name}.json`, data[name]);
      outputFiles = [...outputFiles, `${lang.dst}/${name}.json`];
    }
  }
  Log.debug('update localData ', JSON.stringify(data));
  return data;
}
function reload(cause: string) {
  if (!server) return;
  const { moduleGraph, ws } = server;
  const module = moduleGraph.getModuleById(resolveVirtualModuleId);
  if (module) moduleGraph.invalidateModule(module);
  ws.send({ type: 'full-reload' });
  Log.info('reload cause: %s', cause);
}

export default function langspack(opt: LangspackOpt): Plugin {
  pluginOpt = opt;
  if (pluginOpt.log) Log.config(pluginOpt.log);
  return {
    name: 'vite-plugin-langspack',
    enforce: 'pre',
    config(_config, env) {
      if (!pluginOpt.mode) pluginOpt.mode = env.mode;
      if (pluginOpt.log?.filters?.length) Log.config({ filters: [] });
      Log.info('vite-plugin-langspack opt %o', pluginOpt);
      if (pluginOpt.log) Log.config(pluginOpt.log);
      localData = collectData(pluginOpt.lang, pluginOpt.mode ?? '');
    },
    closeBundle() {
      if (pluginOpt.mode !== 'development') for (const f of outputFiles) unlink(f);
      Log.debug('vite-plugin-langspack end');
    },
    resolveId(source, importer) {
      Log.debug('source %s, importer %s', source, importer);
      if (source !== virtualModuleId) return null;
      const id = resolveVirtualModuleId;
      Log.info('replace %s -> %s', source, id);
      return { id };
    },
    load(id) {
      if (id !== resolveVirtualModuleId) return null;
      return pluginOpt.mode === 'development' ? TmpLocalCode.replace('XXX_DATA', JSON.stringify(localData)) : TmpRemoteCode;
    },
    configureServer(_server: ViteDevServer) {
      server = _server;
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.includes(pluginOpt.lang.src)) return;
      localData = collectData(pluginOpt.lang, pluginOpt.mode ?? '');
      reload(ctx.file);
    },
  };
}
