import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level29",
  title: "正则表达式",
  chapter: 4,
  chapterTitle: "第四章 · 工程实战",
  scenario: "客服系统里的聊天记录里混着手机号和邮箱，你要提取、校验，还要给手机号打码再展示。",
  starter:
    "import re\n\n\ndef extract_phones(text):\n    # 找出文本里所有 11 位手机号（1 开头），返回列表\n    pass\n\n\ndef is_email(s):\n    # 整个字符串必须是邮箱：字母数字下划线或点 @ 域名 . 后缀，如 a.b@x.com\n    pass\n\n\ndef mask_phone(phone):\n    # 保留前 3 位和后 4 位，中间换成 ****\n    pass\n",
  hint: "re.findall(r\"1\\d{10}\", text) 找手机号；re.fullmatch(r\"[\\w.]+@[\\w.]+\\.\\w+\", s) 要求整个字符串匹配；re.sub(r\"(\\d{3})\\d{4}(\\d{4})\", r\"\\1****\\2\", phone) 用分组打码。",
  answer: `import re


def extract_phones(text):
    return re.findall(r"1\\d{10}", text)


def is_email(s):
    return re.fullmatch(r"[\\w.]+@[\\w.]+\\.\\w+", s) is not None


def mask_phone(phone):
    return re.sub(r"(\\d{3})\\d{4}(\\d{4})", r"\\1****\\2", phone)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    {
      type: "exprEquals",
      expr: 'extract_phones("联系 13812345678 或 13987654321，备用 12345")',
      equals: ["13812345678", "13987654321"],
      label: "只提取 11 位手机号，12345 不算",
    },
    { type: "exprEquals", expr: "extract_phones('没有号码')", equals: [], label: "没有手机号时返回空列表" },
    { type: "exprEquals", expr: '[is_email("a.b@x.com"), is_email("tom_1@mail.cn")]', equals: [true, true], label: "合法邮箱返回 True" },
    {
      type: "exprEquals",
      expr: '[is_email("a@b"), is_email("a b@x.com"), is_email("hello"), is_email("x@y.com extra")]',
      equals: [false, false, false, false],
      label: "不合法的返回 False（包括多余内容）",
    },
    { type: "exprEquals", expr: 'mask_phone("13812345678")', equals: "138****5678", label: 'mask_phone 得到 "138****5678"' },
    { type: "codeMatches", pattern: "re\\.(findall|finditer)\\(", label: "用 re.findall 提取" },
    { type: "codeMatches", pattern: "re\\.sub\\(", label: "用 re.sub 替换" },
  ],
  examples: [
    { code: 'import re\nprint(re.findall(r"\\d+", "a1b22c333"))\nprint(re.search(r"(\\w+)@(\\w+)", "tom@mail").groups())', description: "findall 找全部；search 找第一个并用 groups() 取分组" },
    { code: 'import re\nprint(re.fullmatch(r"\\d{3}", "123") is not None)\nprint(re.fullmatch(r"\\d{3}", "1234") is not None)', description: "fullmatch：必须整个字符串都匹配" },
    { code: 'import re\nprint(re.sub(r"\\s+", " ", "a   b \\n c"))', description: "sub：把匹配到的内容替换掉" },
  ],
};

export default level;
