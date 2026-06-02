export const log = (level, msg, meta = {}) => {
  console.log(JSON.stringify({
    level,
    msg,
    ...meta,
    ts: new Date().toISOString(),
    pid: process.pid
  }));
};
