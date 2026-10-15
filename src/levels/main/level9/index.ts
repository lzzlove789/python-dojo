import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level9",
  title: "列表",
  chapter: 2,
  chapterTitle: "第二章 · 数据结构",
  scenario: "你在做购物车功能：用户会不停地加商品、删商品，最后要知道还剩几件。",
  starter: 'cart = ["苹果", "香蕉"]\n\n# 1. 末尾添加 "橙子"\n# 2. 在最前面插入 "牛奶"\n# 3. 删除 "香蕉"\n# 4. count 保存商品数量\n',
  hint: "append 加到末尾，insert(0, x) 加到最前，remove(x) 删除指定元素，len() 得到个数。",
  answer:
    'cart = ["苹果", "香蕉"]\ncart.append("橙子")\ncart.insert(0, "牛奶")\ncart.remove("香蕉")\ncount = len(cart)\nprint(cart, count)\n',
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: "cart", equals: ["牛奶", "苹果", "橙子"], label: "cart 最终是 [牛奶, 苹果, 橙子]" },
    { type: "exprEquals", expr: "count", equals: 3, label: "count 等于 3" },
    { type: "uses", calls: ["append"], label: "用了 append" },
    { type: "uses", calls: ["insert"], label: "用了 insert" },
    { type: "uses", calls: ["remove"], label: "用了 remove" },
  ],
  examples: [
    { code: "nums = [3, 1, 2]\nnums.append(4)\nnums.sort()\nprint(nums)", description: "append 添加、sort 原地排序" },
    { code: 'fruits = ["苹果", "香蕉"]\nprint(fruits[0], fruits[-1], len(fruits))\nprint("苹果" in fruits)', description: "下标访问、len、in 判断是否存在" },
    { code: "nums = [1, 2, 3]\nlast = nums.pop()\nprint(last, nums)", description: "pop 取出并删除最后一个元素" },
  ],
};

export default level;
