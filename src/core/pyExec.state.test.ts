import { describe, it, expect } from "vitest";
import { getTestRunner } from "./testRunner";

// 所有运行共用一个 Python 解释器。用户代码改写标准库留下的副作用，不能带到下一次运行（和下一关）。
describe("标准库模块的状态污染", () => {
  it("改写 json.dumps 后，下一次运行恢复，且检查表达式的求值不受影响", async () => {
    const runner = await getTestRunner();
    const r1 = await runner.run({
      code: "import json\njson.dumps = lambda *a, **k: 'PATCHED'\nx = 1",
      probes: ["x"],
    });
    expect(r1.probes[0]).toMatchObject({ ok: true, value: 1 });
    const r2 = await runner.run({ code: "import json\nprint(json.dumps({'a': 1}))" });
    expect(r2.stdout.trim()).toBe('{"a": 1}');
  });

  it("改写 math.pi / 删除 re.sub / 篡改 os.path.join / 给 random 加属性，下一次运行恢复", async () => {
    const runner = await getTestRunner();
    await runner.run({
      code: [
        "import math, re, os, random",
        "math.pi = 3",
        "del re.sub",
        "os.path.join = lambda *a: 'x'",
        "random.evil = 1",
      ].join("\n"),
    });
    const r = await runner.run({
      code: [
        "import math, re, os, random",
        "print(round(math.pi, 2), hasattr(re, 'sub'), os.path.join('a', 'b'), hasattr(random, 'evil'))",
      ].join("\n"),
    });
    expect(r.error).toBeNull();
    expect(r.stdout.trim()).toBe("3.14 True a/b False");
  });

  it("改写标准库里的 Python 类（collections.Counter.most_common），下一次运行恢复", async () => {
    const runner = await getTestRunner();
    await runner.run({
      code: "from collections import Counter\nCounter.most_common = lambda self, n=None: ['PATCHED']\nCounter.extra = 1",
    });
    const r = await runner.run({
      code: "from collections import Counter\nprint(Counter('aab').most_common(1), hasattr(Counter, 'extra'))",
    });
    expect(r.stdout.trim()).toBe("[('a', 2)] False");
  });

  it("os.environ 的改动不会带到下一次运行", async () => {
    const runner = await getTestRunner();
    await runner.run({ code: "import os\nos.environ['DOJO_X'] = '1'" });
    const r = await runner.run({ code: "import os\nprint('DOJO_X' in os.environ)" });
    expect(r.stdout.trim()).toBe("False");
  });

  it("被用户从 sys.modules 里删掉的标准库模块，下一次运行还在", async () => {
    const runner = await getTestRunner();
    await runner.run({ code: "import sys\ndel sys.modules['json']" });
    const r = await runner.run({ code: "import json\nprint(json.dumps([1]))" });
    expect(r.error).toBeNull();
    expect(r.stdout.trim()).toBe("[1]");
  });

  it("每次运行的复位开销可接受（20 次平均，阈值放宽到 80ms 以防 CI 抖动）", async () => {
    const runner = await getTestRunner();
    await runner.run({ code: "pass" });
    const t0 = performance.now();
    for (let i = 0; i < 20; i++) await runner.run({ code: "pass" });
    const avg = (performance.now() - t0) / 20;
    console.log(`avg per run: ${avg.toFixed(1)}ms`);
    expect(avg).toBeLessThan(80);
  });
});
