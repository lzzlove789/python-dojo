import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level8",
  title: "while 循环",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "理财产品年化 10%，利息滚入本金。你想知道 1000 元要几年才能翻倍到 2000 元以上。",
  starter: "money = 1000\nyears = 0\n\n# 用 while 循环：没到 2000 就继续，每年 money 乘以 1.1，years 加 1\n\n\nprint(years)\n",
  hint: "不知道要循环几次时用 while：while money < 2000:，循环体里 money *= 1.1 并且 years += 1。",
  answer: "money = 1000\nyears = 0\n\nwhile money < 2000:\n    money *= 1.1\n    years += 1\n\nprint(years)\n",
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "years", equals: 8, label: "years 等于 8" },
    { type: "exprEquals", expr: "money >= 2000", equals: true, label: "最终 money 已超过 2000" },
    { type: "stdoutEquals", expected: "8", label: "输出了 8" },
    { type: "codeMatches", pattern: "\\bwhile\\b", label: "用了 while 循环" },
  ],
  examples: [
    { code: "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint('发射！')", description: "倒计时：条件成立就一直循环" },
    { code: "i = 0\nwhile True:\n    i += 1\n    if i == 3:\n        break\nprint(i)", description: "while True + break：满足条件时主动跳出" },
  ],
};

export default level;
