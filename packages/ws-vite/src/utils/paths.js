import * as path from 'path';

export function folder() {
  const folder = process.cwd();
  return folder;
}

export function resolvePaths({ src, dist, assets, icons }) {
  const folder = process.cwd();
  // console.log('folder', folder);
  const metaUrlPath = path.normalize(import.meta.url);
  // console.log('metaUrlPath', metaUrlPath);
  const isMonorepo = metaUrlPath.indexOf(path.normalize('packages/ws-vite/')) !== -1;
  // console.log('isMonorepo', isMonorepo, path.normalize('packages/ws-vite/'));
  const nodeModulesPath = path.resolve(folder, isMonorepo ? '../../node_modules' : './node_modules');
  // console.log('nodeModulesPath', nodeModulesPath);
  const nodeModulesAliasPath = path.resolve(nodeModulesPath, '$1');
  // console.log('nodeModulesAliasPath', nodeModulesAliasPath);
  const paths = {
    folder,
    src,
    dist,
    assets,
    icons,
    srcPath: path.resolve(folder, src),
    distPath: path.resolve(folder, dist),
    assetsPath: path.resolve(folder, assets),
    iconsPath: path.resolve(folder, icons),
    nodeModulesPath: nodeModulesPath,
    nodeModulesAliasPath: nodeModulesAliasPath,
  };
  // console.log('paths', paths);
  return paths;
}
