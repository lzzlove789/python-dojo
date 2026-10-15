# 第 15 关 · enumerate 与 zip

> 场景：姓名和成绩分别存在两个列表里，老师要一份带序号的成绩单。

## 概念讲解

遍历时有两个常见需求，Python 都有现成工具，**别再手写 `range(len(...))` 和下标了**：

**`enumerate`**：遍历的同时拿到序号

```python
for i, name in enumerate(["a", "b"], start=1):
    print(i, name)      # 1 a / 2 b
```

**`zip`**：把多个序列像拉链一样并排配对

```python
for n, s in zip(names, scores):
    print(n, s)
```

两者可以组合，注意解包要加括号：`for i, (n, s) in enumerate(zip(a, b), start=1)`。

`zip` 以**最短**的序列为准；`dict(zip(keys, values))` 是由两个列表构造字典的惯用写法。

## 命令教学

```python
print(" | ".join(["a", "b", "c"]))   # a | b | c
```

`"分隔符".join(字符串列表)` 把列表拼成一个字符串。

## 本关任务

- [ ] 遍历时同时拿到序号（从 1 开始）、姓名、成绩，每行格式 `1. Tom: 88`，追加到 `lines`
- [ ] `table`：`姓名 → 成绩` 的字典
- [ ] 用 `print("\n".join(lines))` 打印（框架已给好）

## 小贴士

- `enumerate` 默认从 0 开始，用 `start=1` 改起点。
- 元素个数不同的两个列表 `zip` 会悄悄丢掉多余的，要小心。
