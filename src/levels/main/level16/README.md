# 第 16 关 · 综合：词频统计

> 场景：第二章期末考：统计一段英文里每个单词出现了几次，并找出出现最多的两个。

## 概念讲解

这一关没有新语法，是把第二章学的东西串起来——这正是"词频统计"这个经典题的价值：

| 步骤 | 用到的知识 |
| --- | --- |
| 拆成单词 | `str.split()` |
| 计数 | 字典 + `get(w, 0) + 1` |
| 找最多的 | `max(d, key=d.get)` |
| 排名取前 N | `sorted(d.items(), key=lambda ...)` + 切片 |

计数的惯用套路：

```python
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
```

`get(w, 0)` 在单词第一次出现时给 0，不用先判断键存不存在。

## 命令教学

```python
d = {"a": 3, "b": 1}
print(sorted(d.items(), key=lambda kv: kv[1], reverse=True))
# [('a', 3), ('b', 1)]
```

## 本关任务

文本是 `"the cat and the dog and the bird"`：

- [ ] `freq`：每个单词出现的次数
- [ ] `top`：出现次数最多的单词
- [ ] `top2`：次数最多的前两项，形如 `[("the", 3), ("and", 2)]`
- [ ] 不使用 `collections.Counter` 和 `.count()`，自己动手统计

## 小贴士

- 实际工作中会直接用 `Counter`，但先亲手写一遍才知道它在做什么。
- 恭喜通关第二章！下一章进入函数与面向对象。
