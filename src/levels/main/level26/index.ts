import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level26",
  title: "文件读写",
  chapter: 4,
  chapterTitle: "第四章 · 工程实战",
  scenario: "你要做一个最简单的待办清单：把事项写进文本文件，下次启动时再读出来。",
  starter:
    "def write_lines(path, lines):\n    # 把 lines 里的每一项各占一行写入文件（覆盖原内容）\n    pass\n\n\ndef append_line(path, line):\n    # 在文件末尾追加一行\n    pass\n\n\ndef read_lines(path):\n    # 读出所有行，去掉每行末尾的换行符，返回列表；文件不存在时返回 []\n    pass\n",
  hint: "with open(path, \"w\", encoding=\"utf-8\") as f: 写入；模式 \"a\" 是追加，\"r\" 是读取。读取时 line.rstrip(\"\\n\")，并用 try/except FileNotFoundError 处理文件不存在。",
  answer: `def write_lines(path, lines):
    with open(path, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\\n")


def append_line(path, line):
    with open(path, "a", encoding="utf-8") as f:
        f.write(line + "\\n")


def read_lines(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return [line.rstrip("\\n") for line in f]
    except FileNotFoundError:
        return []
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    {
      type: "exprEquals",
      expr: '(write_lines("/tmp/dojo_t1.txt", ["买菜", "写代码"]), read_lines("/tmp/dojo_t1.txt"))[1]',
      equals: ["买菜", "写代码"],
      label: "写入后能原样读回（含中文）",
    },
    {
      type: "exprEquals",
      expr: '(write_lines("/tmp/dojo_t2.txt", ["a", "b"]), append_line("/tmp/dojo_t2.txt", "c"), read_lines("/tmp/dojo_t2.txt"))[2]',
      equals: ["a", "b", "c"],
      label: "追加一行后变成 [a, b, c]",
    },
    {
      type: "exprEquals",
      expr: '(write_lines("/tmp/dojo_t3.txt", ["x", "y", "z"]), write_lines("/tmp/dojo_t3.txt", ["new"]), read_lines("/tmp/dojo_t3.txt"))[2]',
      equals: ["new"],
      label: "write_lines 会覆盖旧内容",
    },
    { type: "exprEquals", expr: 'read_lines("/tmp/dojo_not_exist.txt")', equals: [], label: "文件不存在时返回空列表，不崩溃" },
    { type: "codeMatches", pattern: "with\\s+open\\(", label: "用 with open(...) 管理文件" },
  ],
  examples: [
    { code: 'with open("/tmp/demo.txt", "w", encoding="utf-8") as f:\n    f.write("第一行\\n第二行\\n")\n\nwith open("/tmp/demo.txt", encoding="utf-8") as f:\n    print(f.read())', description: "写入再读取（浏览器里的文件在内存虚拟磁盘上，刷新页面就没了）" },
    { code: 'with open("/tmp/demo2.txt", "w") as f:\n    f.write("a\\nb\\n")\nwith open("/tmp/demo2.txt") as f:\n    for line in f:\n        print(line.strip())', description: "按行遍历文件" },
  ],
};

export default level;
