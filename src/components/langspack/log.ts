import { LogConf } from '#/plugin';

let conf = { level: 4, filters: [], maxLen: 10000 };
const config = (cfg: LogConf) => (conf = { ...conf, ...cfg });

function filter(level: number, args: any) {
  if (conf.level < level) return false;
  const msg = JSON.stringify(args);
  for (const f of conf.filters) if (msg.includes(f)) return false;
  for (const k in args) if (typeof args[k] === 'string' && args[k].length > conf.maxLen) args[k] = args[k].slice(0, conf.maxLen - 1) + ' ...';
  return true;
}

function debug(...args: any) {
  if (filter(7, args)) console.log(...args);
}

function info(...args: any) {
  if (filter(6, args)) console.log(...args);
}

function warn(...args: any) {
  if (filter(5, args)) console.log(...args);
}

function err(...args: any) {
  if (filter(4, args)) console.log(...args);
}

export { config, debug, info, warn, err };
