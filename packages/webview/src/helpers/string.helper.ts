export const convertFileSize = (bytes: number) => {
  let unitIndex: number = 0;
  const s: number = 1024;
  while (bytes >= s || -bytes >= s) {
    bytes /= s;
    unitIndex++;
  }
  return (unitIndex ? bytes.toFixed(1) + ' ' : bytes) + ' KMGTPEZY'[unitIndex] + 'B';
};
