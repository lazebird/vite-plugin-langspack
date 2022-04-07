let logLevel = 4;
const setLevel = (level: number) => (logLevel = level);

function debug(...args: any) {
  if (logLevel >= 7) console.log(...args);
}

function info(...args: any) {
  if (logLevel >= 6) console.log(...args);
}

function warn(...args: any) {
  if (logLevel >= 5) console.log(...args);
}

function err(...args: any) {
  if (logLevel >= 4) console.log(...args);
}

export { setLevel, debug, info, warn, err };
