import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level14",
  title: "排序与 key",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "班主任要一份成绩排行榜（高分在前），还要一份按姓名排序的花名册。",
  starter:
    'students = [("Tom", 88), ("Amy", 95), ("Bob", 88), ("Eva", 72)]\n\n# by_score: 按分数从高到低（同分保持原顺序）\n# by_name: 按姓名字母顺序\n',
  hint: "sorted(列表, key=lambda s: s[1], reverse=True)。key 是一个“取排序依据”的函数，lambda s: s[1] 表示取元组的第 2 项。",
  answer:
    'students = [("Tom", 88), ("Amy", 95), ("Bob", 88), ("Eva", 72)]\n\nby_score = sorted(students, key=lambda s: s[1], reverse=True)\nby_name = sorted(students, key=lambda s: s[0])\nprint(by_score)\nprint(by_name)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    {
      type: "exprEquals",
      expr: "by_score",
      equals: [["Amy", 95], ["Tom", 88], ["Bob", 88], ["Eva", 72]],
      label: "by_score 按分数从高到低",
    },
    {
      type: "exprEquals",
      expr: "by_name",
      equals: [["Amy", 95], ["Bob", 88], ["Eva", 72], ["Tom", 88]],
      label: "by_name 按姓名排序",
    },
    { type: "exprEquals", expr: "students[0][0]", equals: "Tom", label: "原列表 students 没有被改动" },
    { type: "codeMatches", pattern: "key\\s*=", label: "用了 key 参数" },
    { type: "codeMatches", pattern: "reverse\\s*=\\s*True", label: "用 reverse=True 做降序" },
  ],
  examples: [
    { code: "print(sorted([3, 1, 2]))\nprint(sorted([3, 1, 2], reverse=True))", description: "sorted 返回新列表，原列表不变" },
    { code: 'words = ["banana", "kiwi", "apple"]\nprint(sorted(words, key=len))', description: "key=len：按长度排序" },
    { code: "f = lambda x: x * 2\nprint(f(5))", description: "lambda：一行写完的匿名小函数" },
  ],
};

export default level;
