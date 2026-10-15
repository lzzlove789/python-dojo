# 第 20 关 · 装饰器

> 场景：老板想知道每个业务函数被调用了几次，但又不想改动每个函数的代码——正好用装饰器。

## 概念讲解

函数在 Python 里是"一等公民"：可以当参数传、当返回值返回。**装饰器**就是一个"接收函数、返回新函数"的函数，用来在不修改原函数的前提下**增强**它（日志、计时、权限检查、缓存……）。

```python
def logged(func):
    def wrapper(*args, **kwargs):
        print("调用", func.__name__)
        return func(*args, **kwargs)
    return wrapper

@logged
def add(a, b):
    return a + b
```

`@logged` 只是语法糖，等价于 `add = logged(add)`。

两个要点：

1. `wrapper` 用 `(*args, **kwargs)` 接收任意参数，再原样转给 `func`——这样装饰器适用于任何函数。
2. 被装饰后 `add` 其实变成了 `wrapper`，名字、文档都变了。用 `functools.wraps` 修复：

```python
from functools import wraps

def logged(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        ...
```

## 本关任务

- [ ] 补全 `logged`：把函数名追加到 `calls`，再调用原函数并返回结果
- [ ] 使用 `@wraps(func)`，让 `add.__name__` 仍是 `"add"`
- [ ] 用 `@logged` 装饰 `add`

## 小贴士

- 别忘了 `return func(...)`，否则被装饰的函数会"丢失"返回值。
- 返回的是 `wrapper` 本身，不要写成 `wrapper()`。
