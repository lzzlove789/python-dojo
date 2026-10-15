import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level12",
  title: "集合与元组",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "市场部导出的邮箱名单里有大量重复，还要找出两个活动的共同参与者。",
  starter:
    'emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"]\na = {1, 2, 3, 4}   # 活动 A 的用户\nb = {3, 4, 5}      # 活动 B 的用户\npoint = (3, 4)\n\n# unique: 去重后的邮箱\n# common: 同时参加了 A 和 B 的用户\n# x, y: 把 point 拆开\n',
  hint: "set(列表) 去重；两个集合用 & 求交集；元组可以直接解包：x, y = point。",
  answer:
    'emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com", "b@x.com"]\na = {1, 2, 3, 4}\nb = {3, 4, 5}\npoint = (3, 4)\n\nunique = set(emails)\ncommon = a & b\nx, y = point\nprint(len(unique), sorted(common), x, y)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "sorted(unique)", equals: ["a@x.com", "b@x.com", "c@x.com"], label: "unique 是 3 个不重复的邮箱" },
    { type: "exprEquals", expr: "sorted(common)", equals: [3, 4], label: "common 是交集 {3, 4}" },
    { type: "exprEquals", expr: "[x, y]", equals: [3, 4], label: "x、y 分别是 3 和 4" },
    { type: "uses", calls: ["set"], label: "用 set() 去重" },
    { type: "uses", nodes: ["BitAnd"], calls: ["intersection"], label: "用交集运算找共同用户" },
  ],
  examples: [
    { code: "s = {1, 2, 2, 3}\nprint(s)\ns.add(9)\nprint(3 in s, len(s))", description: "集合自动去重，in 判断极快" },
    { code: "a, b = {1, 2, 3}, {2, 3, 4}\nprint(a | b)\nprint(a & b)\nprint(a - b)", description: "并集 |、交集 &、差集 -" },
    { code: "t = (1, 2, 3)\nprint(t[0])\n# t[0] = 9   # 取消注释会报错：元组不能修改", description: "元组：不可变的序列" },
  ],
};

export default level;
