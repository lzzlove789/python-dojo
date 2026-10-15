import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level19",
  title: "作用域与闭包",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "你要做一个“计数器工厂”：每次调用工厂得到一个独立的计数器，互不干扰。",
  starter:
    "def make_counter():\n    # 返回一个函数，每次调用返回 1, 2, 3 ...\n    pass\n\n\ndef make_multiplier(n):\n    # 返回一个函数，它把传入的数乘以 n\n    pass\n",
  hint: "在 make_counter 里定义内部变量 count = 0 和内部函数 inc；inc 里用 nonlocal count 才能修改外层的变量。最后 return inc（不带括号）。",
  answer: `def make_counter():
    count = 0

    def inc():
        nonlocal count
        count += 1
        return count

    return inc


def make_multiplier(n):
    def mul(x):
        return x * n

    return mul
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "(lambda c: [c(), c(), c()])(make_counter())", equals: [1, 2, 3], label: "计数器依次返回 1、2、3" },
    {
      type: "exprEquals",
      expr: "(lambda a, b: [a(), a(), b()])(make_counter(), make_counter())",
      equals: [1, 2, 1],
      label: "两个计数器互相独立",
    },
    { type: "exprEquals", expr: "make_multiplier(3)(5)", equals: 15, label: "make_multiplier(3)(5) 返回 15" },
    { type: "exprEquals", expr: "[make_multiplier(k)(10) for k in (2, 3)]", equals: [20, 30], label: "不同的 n 互不影响" },
    { type: "codeMatches", pattern: "\\bnonlocal\\b", label: "用 nonlocal 修改外层变量" },
    { type: "codeForbids", pattern: "\\bglobal\\b", label: "不使用 global" },
  ],
  examples: [
    { code: "x = 10\n\ndef f():\n    x = 99      # 这是局部变量\n    return x\n\nprint(f(), x)", description: "函数内赋值会创建局部变量，不影响外面" },
    { code: "def outer():\n    msg = 'hi'\n    def inner():\n        return msg\n    return inner\n\nf = outer()\nprint(f())", description: "闭包：inner 记住了 outer 里的 msg" },
  ],
};

export default level;
