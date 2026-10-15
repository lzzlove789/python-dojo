import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level16",
  title: "综合：词频统计",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "第二章期末考：统计一段英文里每个单词出现了几次，并找出出现最多的两个。",
  starter:
    'text = "the cat and the dog and the bird"\n\nfreq = {}\n# 1. 把 text 拆成单词，统计每个单词出现的次数，存进 freq\n\n# 2. top: 出现次数最多的那个单词\n\n# 3. top2: 次数最多的前两项，形如 [("the", 3), ("and", 2)]\n\nprint(top2)\n',
  hint: "text.split() 拆单词；循环里 freq[w] = freq.get(w, 0) + 1；max(freq, key=freq.get) 取最多的键；sorted(freq.items(), key=lambda kv: kv[1], reverse=True)[:2] 取前两名。",
  answer: `text = "the cat and the dog and the bird"

freq = {}
for w in text.split():
    freq[w] = freq.get(w, 0) + 1

top = max(freq, key=freq.get)
top2 = sorted(freq.items(), key=lambda kv: kv[1], reverse=True)[:2]

print(top2)
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    {
      type: "exprEquals",
      expr: "freq",
      equals: { the: 3, cat: 1, and: 2, dog: 1, bird: 1 },
      label: "freq 正确统计了每个单词的次数",
    },
    { type: "exprEquals", expr: "top", equals: "the", label: "top 是出现最多的单词 the" },
    { type: "exprEquals", expr: "top2", equals: [["the", 3], ["and", 2]], label: "top2 是前两名 [(the, 3), (and, 2)]" },
    { type: "codeMatches", pattern: "\\.split\\(", label: "用 split() 拆分单词" },
    { type: "codeForbids", pattern: "Counter|\\.count\\(", label: "不借助 Counter / count()，自己用字典统计" },
  ],
  examples: [
    { code: 'print("a b  c".split())\nprint("a,b,c".split(","))', description: "split：不带参数按任意空白拆分" },
    { code: 'd = {"a": 3, "b": 1}\nprint(max(d, key=d.get))\nprint(list(d.items()))', description: "max + key；items() 得到 (键, 值) 对" },
  ],
};

export default level;
