import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level21",
  title: "类与对象",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "银行系统需要“账户”：每个账户有户主和余额，能存钱、取钱，余额不足时要拒绝取款。",
  starter:
    "class BankAccount:\n    def __init__(self, owner, balance=0):\n        # 保存 owner 和 balance\n        pass\n\n    def deposit(self, amount):\n        # 存钱：余额增加\n        pass\n\n    def withdraw(self, amount):\n        # 取钱：余额够就扣款并返回 True；不够就不动余额并返回 False\n        pass\n",
  hint: "在 __init__ 里用 self.owner = owner、self.balance = balance 保存属性；方法里通过 self.balance 读写。withdraw 先判断 amount <= self.balance。",
  answer: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount <= self.balance:
            self.balance -= amount
            return True
        return False
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: 'BankAccount("Tom").owner', equals: "Tom", label: "账户记住了户主 owner" },
    { type: "exprEquals", expr: 'BankAccount("Tom").balance', equals: 0, label: "余额默认是 0" },
    {
      type: "exprEquals",
      expr: '(lambda a: (a.deposit(100), a.withdraw(30), a.balance)[2])(BankAccount("Tom"))',
      equals: 70,
      label: "存 100 再取 30，余额 70",
    },
    { type: "exprEquals", expr: '(lambda a: [a.withdraw(10), a.balance])(BankAccount("Tom", 20))', equals: [true, 10], label: "余额足够时取款成功，返回 True" },
    { type: "exprEquals", expr: '(lambda a: [a.withdraw(50), a.balance])(BankAccount("Tom", 20))', equals: [false, 20], label: "余额不足时返回 False 且余额不变" },
    {
      type: "exprEquals",
      expr: '(lambda a, b: (a.deposit(5), b.balance)[1])(BankAccount("A"), BankAccount("B"))',
      equals: 0,
      label: "不同账户的数据互相独立",
    },
  ],
  examples: [
    { code: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return self.name + ' 汪汪'\n\nd = Dog('Rex')\nprint(d.bark())\nprint(d.name)", description: "类 = 属性 + 方法；对象 = 类的实例" },
    { code: "class A:\n    pass\n\nx, y = A(), A()\nx.v = 1\nprint(hasattr(x, 'v'), hasattr(y, 'v'))", description: "每个对象有自己独立的属性" },
  ],
};

export default level;
