import { genMessage } from '../src/locales/helper';

const modules = import.meta.globEager('./zh_CN/**/*.json');
export default { ...genMessage(modules, 'zh_CN') };
