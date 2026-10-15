import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level30",
  title: "终极关：员工统计报告",
  chapter: 4,
  chapterTitle: "第四章 · 工程实战",
  scenario: "HR 导出了一份 CSV 员工表（里面混着脏数据），要你生成统计报告并存成 JSON 文件。",
  starter: `csv_text = """name,dept,salary
Tom,dev,12000
Amy,dev,15000
Bob,ops,9000

Zed,dev,abc
Eva,ops,11000
Lee,hr,8000
"""


def build_report(text):
    # 解析 CSV 文本（第一行是表头），跳过空行和工资不是整数的脏数据，返回字典：
    # {
    #   "count": 有效员工人数,
    #   "total": 工资总额,
    #   "avg_salary": 平均工资（保留 1 位小数；没有员工时为 0）,
    #   "top": 工资最高的员工姓名（没有员工时为 None）,
    #   "by_dept": {部门: {"count": 人数, "total": 工资和}},
    # }
    pass


def save_report(report, path):
    # 把 report 以 JSON 写入文件 path（保留中文，缩进 2）
    pass
`,
  hint: "csv.DictReader(io.StringIO(text)) 能把文本按表头解析成一行行字典。循环里用 try/except 跳过 int(row[\"salary\"]) 失败的行；by_dept 用 setdefault 或 get 累加；最后 json.dump(report, f, ensure_ascii=False, indent=2)。",
  answer: `import csv
import io
import json

csv_text = """name,dept,salary
Tom,dev,12000
Amy,dev,15000
Bob,ops,9000

Zed,dev,abc
Eva,ops,11000
Lee,hr,8000
"""


def build_report(text):
    rows = []
    for row in csv.DictReader(io.StringIO(text)):
        try:
            rows.append((row["name"], row["dept"], int(row["salary"])))
        except (ValueError, KeyError, TypeError):
            continue

    by_dept = {}
    for _, dept, salary in rows:
        d = by_dept.setdefault(dept, {"count": 0, "total": 0})
        d["count"] += 1
        d["total"] += salary

    total = sum(s for _, _, s in rows)
    return {
        "count": len(rows),
        "total": total,
        "avg_salary": round(total / len(rows), 1) if rows else 0,
        "top": max(rows, key=lambda r: r[2])[0] if rows else None,
        "by_dept": by_dept,
    }


def save_report(report, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "build_report(csv_text)['count']", equals: 5, label: "有效员工 5 人（空行和脏数据被跳过）" },
    { type: "exprEquals", expr: "build_report(csv_text)['total']", equals: 55000, label: "工资总额 55000" },
    { type: "exprEquals", expr: "build_report(csv_text)['avg_salary']", equals: 11000, label: "平均工资 11000.0" },
    { type: "exprEquals", expr: "build_report(csv_text)['top']", equals: "Amy", label: "工资最高的是 Amy" },
    {
      type: "exprEquals",
      expr: "build_report(csv_text)['by_dept']",
      equals: {
        dev: { count: 2, total: 27000 },
        ops: { count: 2, total: 20000 },
        hr: { count: 1, total: 8000 },
      },
      label: "按部门汇总的人数与工资和正确",
    },
    {
      type: "exprEquals",
      expr: 'build_report("name,dept,salary\\nA,x,100")',
      equals: { count: 1, total: 100, avg_salary: 100, top: "A", by_dept: { x: { count: 1, total: 100 } } },
      label: "换一份数据也对（没有写死答案）",
    },
    {
      type: "exprEquals",
      expr: 'build_report("name,dept,salary\\n")',
      equals: { count: 0, total: 0, avg_salary: 0, top: null, by_dept: {} },
      label: "空表不会崩溃（没有除以 0）",
    },
    {
      type: "exprEquals",
      expr: '(save_report(build_report(csv_text), "/tmp/dojo_report.json"), __import__("json").load(open("/tmp/dojo_report.json", encoding="utf-8")))[1]["top"]',
      equals: "Amy",
      label: "报告成功写入 JSON 文件，读回来内容一致",
    },
    { type: "codeMatches", pattern: "try\\s*:", label: "用 try/except 处理脏数据" },
  ],
  examples: [
    { code: 'import csv, io\ntext = "a,b\\n1,2\\n3,4\\n"\nfor row in csv.DictReader(io.StringIO(text)):\n    print(row["a"], row["b"])', description: "csv.DictReader：把每行变成以表头为键的字典" },
    { code: 'd = {}\nfor k in "abca":\n    d.setdefault(k, 0)\n    d[k] += 1\nprint(d)', description: "setdefault：键不存在时先放一个默认值" },
  ],
};

export default level;
