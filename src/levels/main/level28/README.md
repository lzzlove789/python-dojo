# 第 28 关 · 模块与 import

> 场景："不要重复造轮子"——标准库里已经有现成的计数器、日期计算和数学常数，你只管 import。

## 概念讲解

一个 `.py` 文件就是一个**模块**；一堆模块组成**包**。Python 自带的"标准库"开箱即用，第三方库则通过 `pip install` 安装。

三种导入写法：

```python
import math                  # 用法：math.sqrt(4)
import math as m             # 起别名：m.sqrt(4)
from math import sqrt, pi    # 直接引入名字：sqrt(4)
```

约定：`import` 写在文件**最顶部**，按 标准库 → 第三方库 → 自己的模块 分组。

最常用的标准库：

| 模块 | 干什么 |
| --- | --- |
| `math` | 数学函数与常数 |
| `random` | 随机数 |
| `datetime` | 日期时间 |
| `collections` | `Counter`、`defaultdict`、`deque` 等增强容器 |
| `json` / `csv` | 数据格式 |
| `re` | 正则（下一关） |
| `os` / `pathlib` | 文件路径与系统 |

遇到需求先想想：标准库是不是已经有了？

## 命令教学

```python
from datetime import date
print(date(2024, 3, 1) - date(2024, 1, 1))   # 60 days, 0:00:00
```

## 本关任务

- [ ] `most_common_letter(text)`：用 `Counter` 找出出现最多的字母（忽略空格）
- [ ] `days_between(start, end)`：用 `datetime.date` 算两个日期相差几天
- [ ] `circle_area(r)`：用 `math.pi` 计算圆面积，保留 2 位小数

## 小贴士

- `date.fromisoformat("2024-03-01")` 可以直接解析 `YYYY-MM-DD`。
- 不要给自己的文件起名叫 `math.py`、`random.py`，会遮住同名标准库。
