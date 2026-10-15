import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level15",
  title: "enumerate 与 zip",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "姓名和成绩分别存在两个列表里，老师要一份带序号的成绩单。",
  starter:
    'names = ["Tom", "Amy", "Bob"]\nscores = [88, 95, 72]\n\nlines = []\n# 遍历时同时拿到：序号(从 1 开始)、姓名、成绩\n# 每行格式："1. Tom: 88"，追加到 lines\n\n# table: 姓名 -> 成绩 的字典\n\nprint("\\n".join(lines))\n',
  hint: "zip(names, scores) 把两个列表并排配对；enumerate(..., start=1) 给每一项配上序号。解包写法：for i, (n, s) in enumerate(zip(...), start=1)。dict(zip(a, b)) 可直接得到字典。",
  answer: `names = ["Tom", "Amy", "Bob"]
scores = [88, 95, 72]

lines = []
for i, (n, s) in enumerate(zip(names, scores), start=1):
    lines.append(f"{i}. {n}: {s}")

table = dict(zip(names, scores))

print("\\n".join(lines))
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "lines", equals: ["1. Tom: 88", "2. Amy: 95", "3. Bob: 72"], label: "lines 是三行带序号的成绩单" },
    { type: "exprEquals", expr: "table", equals: { Tom: 88, Amy: 95, Bob: 72 }, label: "table 是 姓名 → 成绩 的字典" },
    { type: "stdoutEquals", expected: "1. Tom: 88\n2. Amy: 95\n3. Bob: 72", label: "按行打印出成绩单" },
    { type: "uses", calls: ["enumerate"], label: "用了 enumerate" },
    { type: "uses", calls: ["zip"], label: "用了 zip" },
  ],
  examples: [
    { code: 'for i, name in enumerate(["a", "b", "c"]):\n    print(i, name)', description: "enumerate：同时拿到下标和元素" },
    { code: 'for n, s in zip(["Tom", "Amy"], [88, 95]):\n    print(n, s)', description: "zip：把多个序列并排配对，以最短的为准" },
    { code: 'print(dict(zip(["a", "b"], [1, 2])))\nprint(", ".join(["x", "y", "z"]))', description: "dict(zip(...)) 与 join" },
  ],
};

export default level;
