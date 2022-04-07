export type LocaleType = string; // 'zh_CN' | 'en_US' | 'en' | 'ru' | 'ja' | 'ko';

type Record<K extends keyof any, T> = { [_P in K]: T };
declare type Recordable<T = any> = Record<string, T>;
