import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level18",
  title: "*args 与 **kwargs",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "同事想要一个“能接收任意个数字求和”的函数，还要一个“能接收任意字段生成描述”的函数。",
  starter:
    'def total(*nums):\n    # nums 是一个元组，包含所有传入的位置参数\n    pass\n\n\ndef describe(**info):\n    # info 是一个字典；返回按键名排序的 "k=v, k=v"\n    pass\n\n\nargs = [1, 2, 3]\nopts = {"b": 2, "a": 1}\n\n# result: 用 * 把 args 拆开传给 total\n# text: 用 ** 把 opts 拆开传给 describe\n',
  hint: "*nums 收集多余的位置参数；**info 收集多余的关键字参数。调用时 f(*列表) 把列表拆成位置参数，f(**字典) 把字典拆成关键字参数。",
  answer: `def total(*nums):
    return sum(nums)


def describe(**info):
    return ", ".join(f"{k}={v}" for k, v in sorted(info.items()))


args = [1, 2, 3]
opts = {"b": 2, "a": 1}

result = total(*args)
text = describe(**opts)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "total()", equals: 0, label: "total() 不传参数返回 0" },
    { type: "exprEquals", expr: "total(1, 2, 3, 4)", equals: 10, label: "total(1, 2, 3, 4) 返回 10" },
    { type: "exprEquals", expr: 'describe(name="Tom", age=18)', equals: "age=18, name=Tom", label: "describe 返回按键名排序的描述" },
    { type: "exprEquals", expr: "result", equals: 6, label: "result 等于 6" },
    { type: "exprEquals", expr: "text", equals: "a=1, b=2", label: "text 等于 \"a=1, b=2\"" },
    { type: "usesStar", callee: "total", kind: "*", label: "用 *args 拆开列表传参" },
    { type: "usesStar", callee: "describe", kind: "**", label: "用 **opts 拆开字典传参" },
  ],
  examples: [
    { code: "def show(*args, **kwargs):\n    print(args)\n    print(kwargs)\n\nshow(1, 2, a=3)", description: "args 是元组，kwargs 是字典" },
    { code: "def add(a, b):\n    return a + b\n\nprint(add(*[1, 2]))\nprint(add(**{'a': 5, 'b': 6}))", description: "调用时的 * 和 ** 是“拆包”" },
  ],
};

export default level;
