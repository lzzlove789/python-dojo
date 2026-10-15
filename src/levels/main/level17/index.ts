import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level17",
  title: "函数与默认参数",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "项目里到处复制粘贴同样的几行代码，组长说：“把它们封装成函数！”",
  starter:
    'def greet(name, greeting="你好"):\n    # 返回形如 "你好，Tom！" 的字符串\n    pass\n\n\ndef bmi(weight, height):\n    # 体重(kg) / 身高(m) 的平方，保留 1 位小数\n    pass\n',
  hint: 'return f"{greeting}，{name}！"；BMI 用 round(weight / height ** 2, 1)。默认参数写在函数定义的参数后面：greeting="你好"。',
  answer: `def greet(name, greeting="你好"):
    return f"{greeting}，{name}！"


def bmi(weight, height):
    return round(weight / height ** 2, 1)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: 'greet("Tom")', equals: "你好，Tom！", label: "greet(\"Tom\") 使用默认问候语" },
    { type: "exprEquals", expr: 'greet("Tom", "Hi")', equals: "Hi，Tom！", label: "greet(\"Tom\", \"Hi\") 可以覆盖默认值" },
    { type: "exprEquals", expr: 'greet(greeting="嗨", name="Amy")', equals: "嗨，Amy！", label: "支持关键字参数，顺序可以调换" },
    { type: "exprEquals", expr: "bmi(70, 1.75)", equals: 22.9, label: "bmi(70, 1.75) 返回 22.9" },
    { type: "codeMatches", pattern: "greeting\\s*=\\s*[\"']你好[\"']", label: "greeting 的默认值是 \"你好\"" },
    { type: "codeForbids", pattern: "print\\(", label: "函数用 return 返回结果，而不是 print" },
  ],
  examples: [
    { code: "def add(a, b=10):\n    return a + b\n\nprint(add(1))\nprint(add(1, 2))\nprint(add(b=5, a=1))", description: "默认参数与关键字参数" },
    { code: "def hello():\n    print('hi')\n\nr = hello()\nprint(r)", description: "没有 return 的函数返回 None" },
    { code: "def min_max(nums):\n    return min(nums), max(nums)\n\nlo, hi = min_max([3, 1, 9])\nprint(lo, hi)", description: "返回多个值（其实是元组）" },
  ],
};

export default level;
