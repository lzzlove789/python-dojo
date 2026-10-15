import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level25",
  title: "异常处理",
  chapter: 4,
  chapterTitle: "第四章 · 工程实战",
  scenario: "用户输入千奇百怪：除数为 0、数字写成“abc”、年龄填了负数……程序不能一碰就崩。",
  starter:
    "def safe_div(a, b):\n    # b 为 0 时返回 None，不要让程序崩溃\n    pass\n\n\ndef parse_int(s, default=0):\n    # 能转成整数就返回整数，转不了返回 default\n    pass\n\n\ndef check_age(age):\n    # age < 0 时主动抛出 ValueError，消息里包含 \"年龄\"；否则原样返回 age\n    pass\n",
  hint: "try: ... except ZeroDivisionError: ... 捕获指定类型的异常。主动抛出异常用 raise ValueError(\"年龄不能为负数\")。",
  answer: `def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None


def parse_int(s, default=0):
    try:
        return int(s)
    except ValueError:
        return default


def check_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    return age
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "safe_div(10, 4)", equals: 2.5, label: "safe_div(10, 4) 返回 2.5" },
    { type: "exprEquals", expr: "safe_div(1, 0)", equals: null, label: "safe_div(1, 0) 返回 None 而不是崩溃" },
    { type: "exprEquals", expr: 'parse_int("42")', equals: 42, label: 'parse_int("42") 返回 42' },
    { type: "exprEquals", expr: 'parse_int("abc")', equals: 0, label: 'parse_int("abc") 返回默认值 0' },
    { type: "exprEquals", expr: 'parse_int("x", -1)', equals: -1, label: '自定义默认值：parse_int("x", -1) 返回 -1' },
    { type: "exprEquals", expr: "check_age(20)", equals: 20, label: "check_age(20) 原样返回 20" },
    {
      type: "exprEquals",
      expr: '__import__("unittest").TestCase().assertRaisesRegex(ValueError, "年龄", check_age, -1)',
      equals: null,
      label: "check_age(-1) 抛出 ValueError，且消息含“年龄”",
    },
    { type: "codeForbids", pattern: "except\\s*:", label: "不写裸 except，要指定异常类型" },
  ],
  examples: [
    { code: "try:\n    print(1 / 0)\nexcept ZeroDivisionError as e:\n    print('出错了：', e)\nfinally:\n    print('无论如何都会执行')", description: "try / except / finally" },
    { code: "try:\n    int('abc')\nexcept (ValueError, TypeError):\n    print('转换失败')", description: "一次捕获多种异常" },
    { code: "def f(x):\n    if x < 0:\n        raise ValueError('x 不能为负')\n    return x\n\ntry:\n    f(-1)\nexcept ValueError as e:\n    print(e)", description: "用 raise 主动抛出异常" },
  ],
};

export default level;
