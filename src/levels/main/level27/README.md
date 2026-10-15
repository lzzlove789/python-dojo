# 第 27 关 · JSON

> 场景：前后端之间用 JSON 交换数据：你要能把字典变成 JSON 字符串，也要能把收到的 JSON 解析回来。

## 概念讲解

**JSON** 是一种通用的文本数据格式，几乎所有语言、所有 Web 接口都支持。Python 内置 `json` 模块：

| 函数 | 方向 |
| --- | --- |
| `json.dumps(obj)` | Python 对象 → JSON **字符串** |
| `json.loads(text)` | JSON 字符串 → Python 对象 |
| `json.dump(obj, f)` | 对象 → 写入文件 |
| `json.load(f)` | 从文件读取 → 对象 |

记忆口诀：带 **s**（string）的处理字符串，不带 s 的处理文件。

类型对应关系：

| Python | JSON |
| --- | --- |
| `dict` | object `{}` |
| `list` / `tuple` | array `[]` |
| `str` | string |
| `int` / `float` | number |
| `True` / `False` | `true` / `false` |
| `None` | `null` |

常用参数：`indent=2` 美化缩进，`sort_keys=True` 键排序，`ensure_ascii=False` 保留中文（否则会变成 `中` 这样的转义）。

## 命令教学

```python
import json
s = json.dumps({"a": 1})
print(json.loads(s)["a"])    # 1
```

## 本关任务

框架已给好：

- [ ] `to_json(data)`：键排序、保留中文
- [ ] `from_json(text)`：解析 JSON
- [ ] `active_names(text)`：解析一个用户数组，返回 `active` 为 `true` 的用户名列表

## 小贴士

- JSON 的键只能是字符串；字典里的整数键 dumps 之后会变成字符串。
- 解析不合法的 JSON 会抛 `json.JSONDecodeError`（它是 `ValueError` 的子类），上一关学的 `try/except` 派上用场。
