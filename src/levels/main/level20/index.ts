import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level20",
  title: "装饰器",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "老板想知道每个业务函数被调用了几次，但又不想改动每个函数的代码——正好用装饰器。",
  starter:
    "from functools import wraps\n\ncalls = []   # 记录被调用过的函数名\n\n\ndef logged(func):\n    # 返回一个 wrapper：先把 func.__name__ 追加到 calls，再调用原函数并返回结果\n    pass\n\n\n# 给 add 加上 @logged\ndef add(a, b):\n    return a + b\n",
  hint: "wrapper(*args, **kwargs) 里 calls.append(func.__name__) 然后 return func(*args, **kwargs)；wrapper 上方加 @wraps(func) 保留原函数名；最后 return wrapper。给 add 加 @logged。",
  answer: `from functools import wraps

calls = []


def logged(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        calls.append(func.__name__)
        return func(*args, **kwargs)

    return wrapper


@logged
def add(a, b):
    return a + b
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "(calls.clear(), add(2, 3))[1]", equals: 5, label: "add(2, 3) 仍然返回 5" },
    { type: "exprEquals", expr: "(calls.clear(), add(1, 1), add(2, 2), list(calls))[3]", equals: ["add", "add"], label: "每次调用都被记录进 calls" },
    { type: "exprEquals", expr: "add.__name__", equals: "add", label: "用 @wraps 保留了原函数名 add" },
    { type: "codeMatches", pattern: "^@logged\\s*\\n\\s*def add", label: "用 @logged 语法糖装饰了 add" },
    { type: "codeMatches", pattern: "\\*args\\s*,\\s*\\*\\*kwargs", label: "wrapper 接收任意参数 (*args, **kwargs)" },
  ],
  examples: [
    {
      code: "def shout(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs).upper()\n    return wrapper\n\n@shout\ndef hello(name):\n    return 'hi ' + name\n\nprint(hello('tom'))",
      description: "装饰器：接收一个函数，返回一个“加强版”函数",
    },
    { code: "def hello():\n    return 1\n\nhello = (lambda f: f)(hello)   # @decorator 其实就是这种写法的简写\nprint(hello())", description: "@decorator 只是 f = decorator(f) 的语法糖" },
  ],
};

export default level;
