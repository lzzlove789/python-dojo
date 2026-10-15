# 第 26 关 · 文件读写

> 场景：你要做一个最简单的待办清单：把事项写进文本文件，下次启动时再读出来。

## 概念讲解

用 `open()` 打开文件，配合 `with` 语句使用——离开 `with` 块时文件会**自动关闭**，即使中途出错也一样：

```python
with open("todo.txt", "w", encoding="utf-8") as f:
    f.write("买菜\n")
```

常用模式：

| 模式 | 含义 |
| --- | --- |
| `"r"` | 读取（默认），文件不存在会抛 `FileNotFoundError` |
| `"w"` | 写入，**会清空**原内容 |
| `"a"` | 追加到末尾 |

读取的几种方式：

```python
f.read()          # 整个文件，一个字符串
f.readlines()     # 所有行，列表（每行带 \n）
for line in f:    # 逐行遍历，最省内存
    ...
```

`write` 不会自动加换行，需要自己写 `\n`。中文文件请显式指定 `encoding="utf-8"`。

> 本站的文件存在浏览器内存里的虚拟磁盘上（建议写到 `/tmp/` 下），刷新页面就消失；但在你自己电脑上，代码的写法完全一样。

## 本关任务

- [ ] `write_lines(path, lines)`：每项一行，覆盖写入
- [ ] `append_line(path, line)`：追加一行
- [ ] `read_lines(path)`：读出所有行并去掉末尾换行，文件不存在返回 `[]`
- [ ] 用 `with open(...)`

## 小贴士

- `line.strip()` 会去掉两端所有空白，`line.rstrip("\n")` 只去掉末尾换行，按需选择。
- 读写 JSON、CSV 有专门的模块，下一关就是 JSON。
