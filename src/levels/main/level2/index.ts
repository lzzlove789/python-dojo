import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level2",
  title: "变量与类型",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "书店要上架一本新书，老板让你把商品信息存起来，并算出全部库存的总价值。",
  starter: "# 定义变量\n\n\n# 计算并打印总价值\n",
  hint: "变量用 = 赋值，例如 price = 60.5。字符串加引号，True/False 首字母要大写，两个数相乘用 *。",
  answer:
    'title = "Python入门"\nprice = 60.5\nstock = 10\non_sale = True\ntotal = price * stock\nprint(total)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "title", equals: "Python入门", label: "title 是字符串 \"Python入门\"" },
    { type: "exprEquals", expr: "type(price).__name__ + ' ' + str(price)", equals: "float 60.5", label: "price 是浮点数 60.5" },
    { type: "exprEquals", expr: "type(stock).__name__ + ' ' + str(stock)", equals: "int 10", label: "stock 是整数 10" },
    { type: "exprEquals", expr: "on_sale", equals: true, label: "on_sale 是布尔值 True" },
    { type: "exprEquals", expr: "total", equals: 605.0, label: "total 等于 price * stock" },
    { type: "stdoutEquals", expected: "605.0", label: "用 print 输出了 total" },
    { type: "usesNames", names: ["price", "stock"], label: "total 是用变量 price 和 stock 算出来的" },
  ],
  examples: [
    { code: 'name = "Tom"\nage = 18\nprint(name, age)', description: "变量就是给数据起名字" },
    { code: "x = 5\nprint(type(x))\nprint(type(x / 2))", description: "type() 可以查看类型" },
  ],
};

export default level;
