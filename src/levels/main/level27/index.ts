import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level27",
  title: "JSON",
  chapter: 4,
  chapterTitle: "第四章 · 工程实战",
  scenario: "前后端之间用 JSON 交换数据：你要能把字典变成 JSON 字符串，也要能把收到的 JSON 解析回来。",
  starter:
    "import json\n\n\ndef to_json(data):\n    # 转成 JSON 字符串：键按字母排序，中文不要被转义成 \\uXXXX\n    pass\n\n\ndef from_json(text):\n    # 把 JSON 字符串解析成 Python 对象\n    pass\n\n\ndef active_names(text):\n    # text 是一个 JSON 数组，每项形如 {\"name\": \"A\", \"active\": true}\n    # 返回所有 active 为 true 的 name 组成的列表\n    pass\n",
  hint: "json.dumps(data, ensure_ascii=False, sort_keys=True) 序列化；json.loads(text) 反序列化。active_names 先 loads 得到列表，再用列表推导式筛选。",
  answer: `import json


def to_json(data):
    return json.dumps(data, ensure_ascii=False, sort_keys=True)


def from_json(text):
    return json.loads(text)


def active_names(text):
    users = json.loads(text)
    return [u["name"] for u in users if u["active"]]
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: 'to_json({"name": "小明", "age": 18})', equals: '{"age": 18, "name": "小明"}', label: "to_json：键排序且中文原样保留" },
    { type: "exprEquals", expr: 'to_json({"ok": True, "x": None})', equals: '{"ok": true, "x": null}', label: "True/None 变成 JSON 的 true/null" },
    { type: "exprEquals", expr: 'from_json(\'{"a": [1, 2], "b": null}\')', equals: { a: [1, 2], b: null }, label: "from_json 解析出字典和列表" },
    {
      type: "exprEquals",
      expr: 'active_names(\'[{"name": "A", "active": true}, {"name": "B", "active": false}, {"name": "C", "active": true}]\')',
      equals: ["A", "C"],
      label: "active_names 只返回 active 的用户",
    },
    { type: "hasKeyword", keyword: "ensure_ascii", equals: false, label: "用 ensure_ascii=False 保留中文" },
    { type: "hasKeyword", keyword: "sort_keys", equals: true, label: "用 sort_keys=True 排序键" },
  ],
  examples: [
    { code: 'import json\ns = json.dumps({"name": "Tom", "tags": ["a", "b"]})\nprint(s)\nprint(type(s))', description: "dumps：Python 对象 → JSON 字符串" },
    { code: 'import json\nd = json.loads(\'{"a": 1, "b": [true, null]}\')\nprint(d)\nprint(d["b"][0])', description: "loads：JSON 字符串 → Python 对象（true→True，null→None）" },
    { code: 'import json\nprint(json.dumps({"中": "文"}, ensure_ascii=False, indent=2))', description: "indent 美化输出；ensure_ascii=False 不转义中文" },
  ],
};

export default level;
