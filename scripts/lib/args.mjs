export function parseArgs(argv) {
  const parsed = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      parsed._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

export function unknownOptions(args, knownFlags) {
  const known = knownFlags instanceof Set ? knownFlags : new Set(knownFlags || []);
  return Object.keys(args).filter((key) => key !== "_" && !known.has(key));
}
