import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level23",
  title: "魔术方法",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "你在写一个二维向量类，希望它像内置类型一样好用：能直接相加、比较、打印、求模长。",
  starter:
    "import math\n\n\nclass Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    # __repr__: 返回 \"Vector(1, 2)\" 这样的字符串\n    # __add__:  两个向量相加，返回新的 Vector\n    # __eq__:   x、y 都相等才算相等\n    # __abs__:  返回模长（长度），abs(Vector(3, 4)) == 5.0\n",
  hint: "__repr__ 用 f\"Vector({self.x}, {self.y})\"；__add__(self, other) 返回 Vector(self.x + other.x, ...)；__abs__ 可用 math.hypot(self.x, self.y)。",
  answer: `import math


class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __abs__(self):
        return math.hypot(self.x, self.y)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "repr(Vector(1, 2))", equals: "Vector(1, 2)", label: "repr 显示为 Vector(1, 2)" },
    { type: "exprEquals", expr: "repr(Vector(1, 2) + Vector(3, 4))", equals: "Vector(4, 6)", label: "支持用 + 相加" },
    { type: "exprEquals", expr: "Vector(1, 2) == Vector(1, 2)", equals: true, label: "坐标相同的向量 == 为 True" },
    { type: "exprEquals", expr: "Vector(1, 2) == Vector(2, 1)", equals: false, label: "坐标不同的向量 == 为 False" },
    { type: "exprEquals", expr: "abs(Vector(3, 4))", equals: 5, label: "abs(Vector(3, 4)) 等于 5" },
    { type: "exprEquals", expr: "str(Vector(0, 0))", equals: "Vector(0, 0)", label: "print / str 也使用同样的显示" },
  ],
  examples: [
    { code: "class P:\n    def __init__(self, n):\n        self.n = n\n\n    def __repr__(self):\n        return f'P({self.n})'\n\nprint(P(1))\nprint([P(1), P(2)])", description: "__repr__ 决定对象被打印时的样子" },
    { code: "class Box:\n    def __init__(self, items):\n        self.items = items\n\n    def __len__(self):\n        return len(self.items)\n\nprint(len(Box([1, 2, 3])))", description: "__len__ 让对象支持 len()" },
  ],
};

export default level;
