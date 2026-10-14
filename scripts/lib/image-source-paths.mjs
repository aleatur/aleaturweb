import path from "node:path";

export function isPathInside(directory, target) {
  const relative = path.relative(path.resolve(directory), path.resolve(target));
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export function resolveImageSource(source, roots, fallbackCollection = "archive") {
  const collection = source.collection || fallbackCollection;
  const directory = roots[collection];
  if (!directory) throw new Error(`No source directory configured for collection ${collection}: ${source.id}`);
  const resolvedRoot = path.resolve(directory);
  const inputPath = path.resolve(resolvedRoot, source.file);
  if (!isPathInside(resolvedRoot, inputPath)) throw new Error(`Source escapes directory: ${source.id}`);
  return { collection, root: resolvedRoot, inputPath };
}
