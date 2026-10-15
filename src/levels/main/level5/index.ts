import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level5",
  title: "input 与类型转换",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "你在做一个小程序：问用户叫什么、多大，然后告诉他明年几岁。",
  // 浏览器里没有键盘输入框，这一关的 input() 会依次读到这两行
  stdin: "小明\n17",
  starter: "# input() 会依次读到：小明、17（本关已替你输入好）\n",
  hint: "input() 读到的永远是字符串，算年龄前要用 int() 转成整数。读两次 input()，第一次是名字，第二次是年龄。",
  answer: 'name = input("你叫什么？")\nage = int(input("多大了？"))\nprint(f"{name}明年{age + 1}岁")\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "name", equals: "小明", label: "name 读到了名字 小明" },
    { type: "exprEquals", expr: "type(age).__name__ + str(age)", equals: "int17", label: "age 是整数 17（不是字符串）" },
    { type: "stdoutMatches", pattern: "小明明年18岁", label: "输出了 小明明年18岁", example: "小明明年18岁" },
    { type: "codeMatches", pattern: "int\\(", label: "用 int() 做了类型转换" },
  ],
  examples: [
    { code: 'x = input("随便输入点什么：")\nprint(type(x))', description: "input() 得到的永远是 str（本关预置输入是 小明）" },
    { code: 'print(int("42") + 1)\nprint(str(7) + "天")\nprint(float("3.5") * 2)', description: "int() / str() / float() 互相转换" },
  ],
};

export default level;
