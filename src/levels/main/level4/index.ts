import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level4",
  title: "字符串与 f-string",
  chapter: 1,
  chapterTitle: "第一章 · 初识 Python",
  scenario: "用户在注册框里输入的昵称总带着多余空格，你要先清洗，再按统一格式展示。",
  starter: 'text = "  hello, python  "\n\n# 1. 去掉首尾空格 -> clean\n# 2. 转成大写 -> shout\n# 3. 统计 clean 的字符数 -> n\n# 4. 用 f-string 打印\n',
  hint: "strip() 去首尾空格，upper() 转大写，len() 数长度。f-string 写法：f\"{shout} 共 {n} 个字符\"。",
  answer:
    'text = "  hello, python  "\nclean = text.strip()\nshout = clean.upper()\nn = len(clean)\nprint(f"{shout} 共 {n} 个字符")\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "clean", equals: "hello, python", label: "clean 是去掉首尾空格后的文本" },
    { type: "exprEquals", expr: "shout", equals: "HELLO, PYTHON", label: "shout 是 clean 的大写形式" },
    { type: "exprEquals", expr: "n", equals: 13, label: "n 是 clean 的字符数 13" },
    { type: "stdoutEquals", expected: "HELLO, PYTHON 共 13 个字符", label: "输出了 HELLO, PYTHON 共 13 个字符" },
    { type: "codeMatches", pattern: "f[\"']", label: "用了 f-string 来格式化" },
  ],
  examples: [
    { code: 'print("  hi  ".strip())\nprint("abc".upper())\nprint(len("你好"))', description: "strip / upper / len" },
    { code: 'word = "Python"\nprint(word[0], word[-1])\nprint(word[1:4])', description: "下标与切片：从 0 开始，-1 是最后一个" },
    { code: 'name, n = "Tom", 3\nprint(f"{name} 买了 {n * 2} 本书")', description: "f-string 花括号里可以放表达式" },
  ],
};

export default level;
