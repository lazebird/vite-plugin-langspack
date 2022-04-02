import { genMessage } from '../src/locales/helper';

const modules = import.meta.globEager('./en_US/**/*.json');
export default { ...genMessage(modules, 'en_US') };
