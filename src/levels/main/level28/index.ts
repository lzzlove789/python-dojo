import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level28",
  title: "模块与 import",
  chapter: 4,
  chapterTitle: "第四章 · 工程实战",
  scenario: "“不要重复造轮子”——标准库里已经有现成的计数器、日期计算和数学常数，你只管 import。",
  starter:
    "# 在这里 import 你需要的模块\n\n\ndef most_common_letter(text):\n    # 返回 text 中出现次数最多的字母（忽略空格；用 collections.Counter）\n    pass\n\n\ndef days_between(start, end):\n    # start、end 是 \"YYYY-MM-DD\" 格式的日期字符串，返回相差的天数（用 datetime）\n    pass\n\n\ndef circle_area(r):\n    # 圆面积，保留 2 位小数（用 math.pi）\n    pass\n",
  hint: "from collections import Counter：Counter(字符串).most_common(1) 返回 [(字符, 次数)]。from datetime import date：date.fromisoformat(s) 解析日期，两个日期相减得到 timedelta，取 .days。import math 后用 math.pi。",
  answer: `import math
from collections import Counter
from datetime import date


def most_common_letter(text):
    letters = text.replace(" ", "")
    return Counter(letters).most_common(1)[0][0]


def days_between(start, end):
    return (date.fromisoformat(end) - date.fromisoformat(start)).days


def circle_area(r):
    return round(math.pi * r ** 2, 2)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: 'most_common_letter("hello world")', equals: "l", label: 'most_common_letter("hello world") 是 "l"' },
    { type: "exprEquals", expr: 'days_between("2024-01-01", "2024-03-01")', equals: 60, label: "2024-01-01 到 2024-03-01 相差 60 天（含闰年）" },
    { type: "exprEquals", expr: 'days_between("2024-03-01", "2024-01-01")', equals: -60, label: "日期倒过来得到负数" },
    { type: "exprEquals", expr: "circle_area(2)", equals: 12.57, label: "circle_area(2) 返回 12.57" },
    { type: "codeMatches", pattern: "Counter", label: "使用了 collections.Counter" },
    { type: "codeMatches", pattern: "\\bimport\\s+math\\b|from\\s+math\\s+import", label: "导入了 math" },
    { type: "codeMatches", pattern: "from\\s+datetime\\s+import|import\\s+datetime", label: "导入了 datetime" },
  ],
  examples: [
    { code: "import math\nprint(math.sqrt(16), math.pi)\nprint(math.floor(3.7), math.ceil(3.2))", description: "import 模块，再用 模块名.功能" },
    { code: "from collections import Counter\nprint(Counter('banana'))\nprint(Counter('banana').most_common(2))", description: "from ... import 直接引入某个名字" },
    { code: "import random\nrandom.seed(1)\nprint(random.randint(1, 100))\nprint(random.choice(['a', 'b', 'c']))", description: "random：随机数（seed 固定后结果可重复）" },
    { code: "from datetime import date, timedelta\nd = date(2024, 2, 28) + timedelta(days=2)\nprint(d, d.weekday())", description: "date + timedelta 做日期加减" },
  ],
};

export default level;
