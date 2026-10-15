# 第 23 关 · 魔术方法

> 场景：你在写一个二维向量类，希望它像内置类型一样好用：能直接相加、比较、打印、求模长。

## 概念讲解

名字前后各有两个下划线的方法（`__xxx__`），叫**魔术方法**（dunder methods）。你不用手动调用它们，Python 会在特定场合自动调用：

| 你写的代码 | Python 实际调用 |
| --- | --- |
| `Vector(1, 2)` | `__init__` |
| `print(v)` / `repr(v)` | `__repr__`（或 `__str__`） |
| `a + b` | `a.__add__(b)` |
| `a == b` | `a.__eq__(b)` |
| `len(x)` | `x.__len__()` |
| `abs(x)` | `x.__abs__()` |
| `x[i]` | `x.__getitem__(i)` |

给自己的类实现这些方法，它就能像 `int`、`list` 一样自然地参与运算——这就是 Python 的"数据模型"。

`__repr__` 是给开发者看的"官方表示"，最好能让人一眼看出对象是什么；如果没写 `__str__`，`print` 也会用它。

## 命令教学

```python
class P:
    def __init__(self, n):
        self.n = n
    def __repr__(self):
        return f"P({self.n})"

print(P(1))    # P(1)
```

## 本关任务

补全 `Vector`：

- [ ] `__repr__` → `Vector(1, 2)`
- [ ] `__add__` → `Vector(1, 2) + Vector(3, 4)` 得到 `Vector(4, 6)`
- [ ] `__eq__` → 坐标都相等才相等
- [ ] `__abs__` → 模长，`abs(Vector(3, 4))` 等于 `5`

## 小贴士

- 重写 `__eq__` 后，默认的 `__hash__` 会被取消，对象就不能当字典键了——需要时再补 `__hash__`。
- 只写 `__repr__` 就够用了：`print` 和 `str()` 会自动回退到它。
