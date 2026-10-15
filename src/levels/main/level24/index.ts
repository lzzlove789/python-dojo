import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level24",
  title: "生成器与迭代器",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "斐波那契数列要多少有多少，你不想一次把它们全放进内存——让生成器“用一个、算一个”。",
  starter:
    "def fib(n):\n    # 用 yield 依次产出前 n 个斐波那契数：0, 1, 1, 2, 3, 5 ...\n    pass\n\n\n# first_big: 斐波那契数列里第一个大于 1000 的数\n# 提示：next() + 生成器表达式，并用 fib(100) 作为数据源\n",
  hint: "在函数里用 yield 产出值，函数就变成生成器：a, b = 0, 1，循环 n 次，每次 yield a 然后 a, b = b, a + b。取第一个满足条件的值：next(x for x in fib(100) if x > 1000)。",
  answer: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b


first_big = next(x for x in fib(100) if x > 1000)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "list(fib(8))", equals: [0, 1, 1, 2, 3, 5, 8, 13], label: "list(fib(8)) 是前 8 个斐波那契数" },
    { type: "exprEquals", expr: "list(fib(0))", equals: [], label: "fib(0) 不产出任何值" },
    { type: "exprEquals", expr: "type(fib(3)).__name__", equals: "generator", label: "fib 返回的是生成器对象" },
    { type: "exprEquals", expr: "first_big", equals: 1597, label: "first_big 等于 1597" },
    { type: "uses", nodes: ["Yield", "YieldFrom"], label: "fib 里使用了 yield" },
    { type: "uses", calls: ["next"], label: "用 next() 取第一个满足条件的值" },
    { type: "forbids", calls: ["append"], label: "不把结果攒进列表，逐个 yield" },
  ],
  examples: [
    { code: "def count_up(n):\n    i = 0\n    while i < n:\n        yield i\n        i += 1\n\nfor x in count_up(3):\n    print(x)", description: "yield 产出一个值后暂停，下次接着往下执行" },
    { code: "g = (x * x for x in range(3))\nprint(next(g), next(g), next(g))\n# 再 next(g) 就会抛出 StopIteration", description: "生成器表达式与 next()" },
    { code: "it = iter([10, 20])\nprint(next(it))\nprint(next(it))\nprint(next(it, '没了'))", description: "迭代器：next 逐个取，耗尽后 next 可以给默认值" },
  ],
};

export default level;
