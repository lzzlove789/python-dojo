# 第 25 关 · 异常处理

> 场景：用户输入千奇百怪：除数为 0、数字写成"abc"、年龄填了负数……程序不能一碰就崩。

## 概念讲解

程序运行时出错会**抛出异常**，如果没人处理，程序就崩溃并打印 traceback。用 `try / except` 接住它：

```python
try:
    可能出错的代码
except ZeroDivisionError:
    出错后的补救
else:
    没出错时执行（可选）
finally:
    无论如何都执行，常用于释放资源（可选）
```

常见异常：

| 异常 | 典型场景 |
| --- | --- |
| `ValueError` | `int("abc")` |
| `ZeroDivisionError` | `1 / 0` |
| `KeyError` | 字典里没有这个键 |
| `IndexError` | 下标越界 |
| `TypeError` | 类型不对，如 `"1" + 1` |
| `FileNotFoundError` | 打开不存在的文件 |

你也可以用 `raise` **主动抛出**异常，表示"调用者传了不合法的数据"。

## 命令教学

```python
try:
    n = int("abc")
except ValueError as e:
    print("转换失败：", e)
```

## 本关任务

- [ ] `safe_div(a, b)`：除数为 0 时返回 `None`
- [ ] `parse_int(s, default=0)`：转换失败返回 `default`
- [ ] `check_age(age)`：小于 0 时 `raise ValueError`，消息包含 `"年龄"`
- [ ] 不写裸 `except:`，要指定异常类型

## 小贴士

- 只捕获你**有能力处理**的异常。裸 `except:` 会把 Ctrl+C、拼写错误等也一并吞掉，bug 会变得极难查。
- `except` 的顺序是从上到下匹配，具体的异常放前面。
