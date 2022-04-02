export interface LangspackOpt {
  mode: string;
  src: string;
  dst: string;
}

export interface JsonFile {
  path: string;
  data: object;
}

export interface LoadOpt {
  dir: string;
  include?: RegExp | ((_filename: string) => boolean);
  exclude?: RegExp | ((_filename: string) => boolean);
}

export interface MatchOpt {
  file: string;
  include?: RegExp | ((_filename: string) => boolean);
  exclude?: RegExp | ((_filename: string) => boolean);
}
