import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level10",
  title: "切片",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "运营给了你 1 到 10 号的用户名单，要你分别取出前 3 个、后 3 个、偶数位和倒序名单。",
  starter: "nums = list(range(1, 11))   # [1, 2, ..., 10]\n\n# first3: 前 3 个\n# last3: 最后 3 个\n# evens: 2, 4, 6, 8, 10\n# rev: 倒序\n",
  hint: "切片格式是 lst[起点:终点:步长]，终点不包含。负数从末尾数；步长为 -1 表示倒着取。",
  answer: "nums = list(range(1, 11))\nfirst3 = nums[:3]\nlast3 = nums[-3:]\nevens = nums[1::2]\nrev = nums[::-1]\nprint(first3, last3, evens, rev)\n",
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "first3", equals: [1, 2, 3], label: "first3 是 [1, 2, 3]" },
    { type: "exprEquals", expr: "last3", equals: [8, 9, 10], label: "last3 是 [8, 9, 10]" },
    { type: "exprEquals", expr: "evens", equals: [2, 4, 6, 8, 10], label: "evens 是 [2, 4, 6, 8, 10]" },
    { type: "exprEquals", expr: "rev", equals: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], label: "rev 是倒序列表" },
    { type: "codeForbids", pattern: "\\bfor\\b|\\.reverse\\(|reversed\\(", label: "全部用切片完成，不写循环" },
  ],
  examples: [
    { code: "s = [10, 20, 30, 40, 50]\nprint(s[1:3])\nprint(s[:2])\nprint(s[3:])", description: "起点包含、终点不包含；省略表示到头/到尾" },
    { code: 's = "Python"\nprint(s[::-1])\nprint(s[::2])', description: "字符串同样支持切片" },
  ],
};

export default level;
