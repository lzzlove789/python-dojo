import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level3",
  title: "运算符",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "播放器显示时长需要“分:秒”格式，而后台只给了总秒数，你要把它拆开。",
  starter: "total_seconds = 1000\n\n# 在下面算出 minutes 和 seconds\n\n\n# 再算出 1 KB 有多少字节：2 的 10 次方\n\n",
  hint: "// 是整除（丢掉小数），% 是取余数，** 是幂运算。1000 秒 = 16 分 40 秒。",
  answer:
    "total_seconds = 1000\nminutes = total_seconds // 60\nseconds = total_seconds % 60\nkb = 2 ** 10\nprint(f\"{minutes}分{seconds}秒\", kb)\n",
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "minutes", equals: 16, label: "minutes 等于 16" },
    { type: "exprEquals", expr: "seconds", equals: 40, label: "seconds 等于 40" },
    { type: "exprEquals", expr: "kb", equals: 1024, label: "kb 等于 1024" },
    { type: "uses", nodes: ["FloorDiv"], label: "用 // 做了整除" },
    { type: "uses", nodes: ["Mod"], label: "用 % 取了余数" },
    { type: "uses", nodes: ["Pow"], label: "用 ** 做了幂运算" },
  ],
  examples: [
    { code: "print(7 / 2)\nprint(7 // 2)\nprint(7 % 2)", description: "除法 / 得小数，// 取商，% 取余" },
    { code: "print(2 ** 3)\nprint(10 ** 2)", description: "** 是幂运算" },
    { code: 'm, s = 3, 5\nprint(f"{m}分{s}秒")', description: "f-string：在字符串前加 f，花括号里放变量" },
  ],
};

export default level;
