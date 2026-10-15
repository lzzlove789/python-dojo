import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level6",
  title: "条件判断",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "老师让你写个自动评级程序：90 分以上 A，80 以上 B，60 以上 C，其余 D。",
  starter: "def grade(score):\n    # 在这里用 if / elif / else 判断，并 return 等级\n    pass\n",
  hint: "从高到低依次判断：if score >= 90: return \"A\"，然后 elif score >= 80 ...，最后 else。",
  answer:
    'def grade(score):\n    if score >= 90:\n        return "A"\n    elif score >= 80:\n        return "B"\n    elif score >= 60:\n        return "C"\n    else:\n        return "D"\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "grade(95)", equals: "A", label: "grade(95) 返回 \"A\"" },
    { type: "exprEquals", expr: "grade(90)", equals: "A", label: "边界：grade(90) 返回 \"A\"" },
    { type: "exprEquals", expr: "grade(85)", equals: "B", label: "grade(85) 返回 \"B\"" },
    { type: "exprEquals", expr: "grade(60)", equals: "C", label: "边界：grade(60) 返回 \"C\"" },
    { type: "exprEquals", expr: "grade(59)", equals: "D", label: "grade(59) 返回 \"D\"" },
    { type: "uses", nodes: ["Elif"], label: "用了 elif 做多分支判断" },
  ],
  examples: [
    { code: 'age = 20\nif age >= 18:\n    print("成年")\nelse:\n    print("未成年")', description: "if / else：缩进（4 个空格）表示属于哪个分支" },
    { code: "x = 7\nprint(x > 5 and x < 10)\nprint(x == 7)\nprint(not x == 7)", description: "比较运算和 and / or / not" },
    { code: "def double(n):\n    return n * 2\n\nprint(double(4))", description: "函数雏形：def 定义，return 返回结果（第三章详讲）" },
  ],
};

export default level;
