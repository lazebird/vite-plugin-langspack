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

function file2obj(file: JsonFile, parent: any) {
  const extname = path.extname(file.path);
  if (file.path.slice(-extname.length) !== extname) return;
  const p = file.path.slice(file.path.charAt(0) === '/' ? 1 : 0, -extname.length);
  for (const d of p.split('/')) {
    if (!parent[d]) parent[d] = {};
    parent = parent[d];
  }
  Object.assign(parent, file.data);
}
const obj2file = (path: string, obj: any) => fs.writeFileSync(path, JSON.stringify(obj, null, 2));

const unlink = (path: string) => fs.unlinkSync(path);

export { file2content, dir2files, file2obj, obj2file, unlink };
