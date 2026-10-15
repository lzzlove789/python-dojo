import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level11",
  title: "字典",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "仓库用字典记录“商品名 → 库存”。今天进货、出库、下架一通操作，你要把账记对。",
  starter: 'stock = {"苹果": 5, "香蕉": 0}\n\n# 1. 新增 "橙子": 8\n# 2. "苹果" 进货 3 个\n# 3. 下架 "香蕉"（删除这个键）\n# 4. grape 保存 "葡萄" 的库存；没有记录时当作 0（别报 KeyError）\n',
  hint: "stock[键] = 值 可新增或修改；del stock[键] 删除；stock.get(键, 默认值) 取不到时不会报错。",
  answer:
    'stock = {"苹果": 5, "香蕉": 0}\nstock["橙子"] = 8\nstock["苹果"] += 3\ndel stock["香蕉"]\ngrape = stock.get("葡萄", 0)\nprint(stock, grape)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "stock", equals: { 苹果: 8, 橙子: 8 }, label: "stock 最终是 {苹果: 8, 橙子: 8}" },
    { type: "exprEquals", expr: "grape", equals: 0, label: "grape 等于 0" },
    { type: "uses", calls: ["get"], label: "用 get() 安全取值" },
    { type: "uses", nodes: ["Delete"], calls: ["pop"], label: "删除了键" },
  ],
  examples: [
    { code: 'user = {"name": "Tom", "age": 18}\nprint(user["name"])\nuser["age"] = 19\nprint(user)', description: "按键取值、修改" },
    { code: 'd = {"a": 1, "b": 2}\nfor k, v in d.items():\n    print(k, v)\nprint(list(d.keys()), list(d.values()))', description: "遍历：items / keys / values" },
    { code: 'd = {"a": 1}\nprint("a" in d, "z" in d)\nprint(d.get("z"))', description: "in 判断键是否存在；get 取不到返回 None" },
  ],
};

export default level;
