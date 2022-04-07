interface Langs {
  mode: string;
  src: string;
  dst: string;
}
export interface LangspackOpt {
  langs: Langs[];
  logLevel?: number;
  mode?: string;
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
