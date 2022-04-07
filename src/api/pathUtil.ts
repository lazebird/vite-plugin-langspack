function basename(path: string, ext = '') {
  const name = path.split('/').reverse()[0];
  return name.slice(0, name.length - ext.length);
}

function dirname(path: string) {
  const lastindex = path.lastIndexOf('/');
  return path.slice(0, lastindex);
}

function extname(path: string) {
  const lastindex = path.lastIndexOf('.');
  return path.slice(lastindex);
}

function resolve(...paths: string[]) {
  console.log('origin path ', paths.join(' '));
  const roots = paths.filter((p) => p.charAt(0) === '/');
  if (roots.length) {
    const rootIndex = paths.lastIndexOf(roots[roots.length - 1]);
    paths = paths.slice(rootIndex);
  } else {
    paths = ['/', ...paths];
  }
  paths = paths.join('/').split('/');
  // filter '' '.' '..'
  return paths.join('/');
}

export { basename, dirname, extname, resolve };
