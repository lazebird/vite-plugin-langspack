import * as fs from 'fs';
import * as path from 'path';
import type { JsonFile, LoadOpt, MatchOpt } from '#/plugin';

function matchFiles({ file, include, exclude }: MatchOpt): boolean {
  if (fs.statSync(file).isDirectory()) return true;
  if ((exclude instanceof RegExp && exclude.test(file)) || (typeof exclude === 'function' && exclude(file))) return false;
  if (include && !((include instanceof RegExp && include.test(file)) || (typeof include === 'function' && include(file)))) return false;
  return true;
}

const file2content = (path: string) => fs.readFileSync(path, { encoding: 'utf8' });

function dir2files({ dir, include, exclude }: LoadOpt) {
  if (!fs.statSync(dir)?.isDirectory()) return [];
  let data = [] as any[];
  const files = fs.readdirSync(dir).map((file) => path.resolve(dir, file));
  for (const f of files) {
    if (fs.statSync(f).isDirectory()) data = [...data, ...dir2files({ dir: f, include, exclude })];
    else if (matchFiles({ include, exclude, file: f })) data = [...data, f];
  }
  return data;
}

function getSubdirs(dir: string) {
  if (!fs.statSync(dir)?.isDirectory()) return [];
  const data = fs.readdirSync(dir).map((file) => path.resolve(dir, file));
  return data.filter((f) => fs.statSync(f).isDirectory());
}

function file2obj(file: JsonFile, parent: any) {
  const p = path.parse(file.path);
  for (const d of [...p.dir.split(path.sep), p.name].filter((f) => f)) {
    if (!parent[d]) parent[d] = {};
    parent = parent[d];
  }
  Object.assign(parent, file.data);
}
const obj2file = (path: string, obj: any) => fs.writeFileSync(path, JSON.stringify(obj, null, 2));

const unlink = (path: string) => fs.unlinkSync(path);

export { file2content, dir2files, getSubdirs, file2obj, obj2file, unlink };
