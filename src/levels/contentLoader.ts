// 关卡教程（README.md）按需懒加载：首次访问某关时才加载其教程文本
const readmeLoaders = import.meta.glob("./main/*/README.md", {
  query: "?raw",
  import: "default",
  eager: false,
});

const cache = new Map<string, string>();

export async function loadLevelContent(key: string): Promise<string> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const loader = readmeLoaders[`./main/${key}/README.md`];
  if (!loader) return "";
  const content = (await loader()) as string;
  cache.set(key, content);
  return content;
}
