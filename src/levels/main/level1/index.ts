import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level1",
  title: "第一次打招呼",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "新同事第一天入职，组长让你先在编辑器里跑通人生中第一个 Python 脚本。",
  starter: "# 在下面写代码，然后点「运行」\n",
  hint: "用 print() 输出内容：文字要放在引号里，算式不用引号，Python 会先算出结果再打印。",
  answer: 'print("Hello, Python!")\nprint(1 + 2 * 3)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "stdoutMatches", pattern: "^Hello, Python!$", label: "输出了一行 Hello, Python!", example: "Hello, Python!" },
    { type: "stdoutMatches", pattern: "^7$", label: "输出了 1 + 2 * 3 的计算结果", example: "7" },
    { type: "uses", nodes: ["BinOp"], label: "7 是算出来的，不是直接写死的" },
  ],
  examples: [
    { code: 'print("你好，世界")', description: "打印文字（字符串要放在引号里）" },
    { code: "print(10 - 3)", description: "打印算式的结果" },
    { code: 'print("年龄：", 18)', description: "print 可以一次打印多个内容，用逗号隔开" },
  ],
};

export default level;
