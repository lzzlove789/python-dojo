/**
 * 草稿防抖保存：每敲一个字就写一次 localStorage（整个 store 序列化）太浪费。
 * 按 key 记录“最后一次要保存的内容”，停手 delay 毫秒后统一写入；
 * 切关/离开页面时调用 flush() 立刻写，保证不丢。
 * 关键点：不同 key 的待保存内容互不覆盖（切关后旧关卡的草稿照样会被写入）。
 */
export function createDraftSaver(save: (key: string, value: string) => void, delay = 400) {
  const pending = new Map<string, string>();
  let timer: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const entries = [...pending];
    pending.clear();
    for (const [key, value] of entries) save(key, value);
  }

  function queue(key: string, value: string) {
    pending.set(key, value);
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(flush, delay);
  }

  return { queue, flush };
}
