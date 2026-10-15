import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level13",
  title: "列表推导式",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "数据分析的同事看你用四行循环生成列表直摇头：“这一行就能搞定。”",
  starter: 'nums = list(range(1, 11))\nwords = ["apple", "kiwi", "banana"]\n\n# squares: nums 每个数的平方\n# even_sq: 只取偶数，再平方\n# lengths: words 中每个单词的长度\n',
  hint: "格式 [表达式 for 变量 in 序列 if 条件]，if 可省略。例如 [n * n for n in nums]。",
  answer:
    'nums = list(range(1, 11))\nwords = ["apple", "kiwi", "banana"]\n\nsquares = [n * n for n in nums]\neven_sq = [n * n for n in nums if n % 2 == 0]\nlengths = [len(w) for w in words]\nprint(squares, even_sq, lengths)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "squares", equals: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100], label: "squares 是 1 到 10 的平方" },
    { type: "exprEquals", expr: "even_sq", equals: [4, 16, 36, 64, 100], label: "even_sq 是偶数的平方" },
    { type: "exprEquals", expr: "lengths", equals: [5, 4, 6], label: "lengths 是 [5, 4, 6]" },
    { type: "uses", nodes: ["ListComp"], label: "用了列表推导式" },
    { type: "forbids", nodes: ["For"], label: "不使用独立的 for 循环语句" },
  ],
  examples: [
    { code: "print([i * 2 for i in range(5)])", description: "最简单的推导式" },
    { code: "print([i for i in range(10) if i % 3 == 0])", description: "带条件过滤" },
    { code: 'print([c.upper() for c in "abc"])', description: "任何可迭代对象都能推导" },
  ],
};

export default level;
