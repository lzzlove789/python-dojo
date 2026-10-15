import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level7",
  title: "for 循环",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "财务让你算 1 到 100 的累加，以及其中所有偶数的和——别想着手算，让循环来干活。",
  starter: "total = 0\neven_sum = 0\n\n# 用 for 循环遍历 1 到 100\n\n\nprint(total, even_sum)\n",
  hint: "range(1, 101) 产生 1 到 100。循环里 total += i；用 if i % 2 == 0 判断偶数再累加到 even_sum。",
  answer:
    "total = 0\neven_sum = 0\n\nfor i in range(1, 101):\n    total += i\n    if i % 2 == 0:\n        even_sum += i\n\nprint(total, even_sum)\n",
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "total", equals: 5050, label: "total 等于 1 到 100 的和 5050" },
    { type: "exprEquals", expr: "even_sum", equals: 2550, label: "even_sum 等于 100 以内偶数的和 2550" },
    { type: "uses", nodes: ["For"], label: "用了 for 循环" },
    { type: "uses", calls: ["range"], label: "用 range() 生成 1 到 100" },
    { type: "forbids", calls: ["sum"], label: "不能直接用内置 sum()，请自己循环累加" },
  ],
  examples: [
    { code: "for i in range(3):\n    print(i)", description: "range(3) 产生 0、1、2" },
    { code: "for i in range(1, 6):\n    print(i * i)", description: "range(1, 6) 产生 1 到 5（不含 6）" },
    { code: 'for ch in "abc":\n    print(ch)', description: "字符串也能被遍历" },
  ],
};

export default level;
