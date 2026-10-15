# 第 30 关 · 终极关：员工统计报告

> 场景：HR 导出了一份 CSV 员工表（里面混着脏数据），要你生成统计报告并存成 JSON 文件。

## 概念讲解

最后一关没有新语法，而是一个小型的"真实任务"：**读数据 → 清洗 → 统计 → 输出**。你需要把前面 29 关的东西串起来：

| 环节 | 用到的知识 |
| --- | --- |
| 解析 CSV 文本 | `csv.DictReader` + `io.StringIO`（第 28 关：标准库） |
| 跳过脏数据 | `try / except`（第 25 关） |
| 按部门分组累加 | 字典、`setdefault` / `get`（第 11、16 关） |
| 总额、平均、最高 | `sum`、`max(key=...)`、推导式（第 13、14 关） |
| 输出报告 | `json.dump`、`with open`（第 26、27 关） |
| 封装复用 | 函数（第 17 关） |

CSV 的解析套路：

```python
import csv, io
for row in csv.DictReader(io.StringIO(text)):
    print(row["name"], row["salary"])     # 每行是一个字典，注意值都是字符串
```

`DictReader` 会自动跳过空行；但值是字符串，要自己 `int(...)`，而且**脏数据会让 `int` 抛 `ValueError`**。

## 本关任务

`csv_text` 已给好（里面有一行空行和一行工资是 `abc` 的脏数据）：

- [ ] `build_report(text)` 返回字典：`count`、`total`、`avg_salary`（保留 1 位小数）、`top`（工资最高者姓名）、`by_dept`（每个部门的人数与工资和）
- [ ] 脏数据行要跳过，**不能**让程序崩溃；没有任何有效数据时 `avg_salary` 为 0、`top` 为 `None`
- [ ] `save_report(report, path)` 把报告以 JSON 写入文件（保留中文，缩进 2）
- [ ] 答案不能写死：评分会用**别的数据**再测一遍

## 小贴士

- 先把"解析 + 清洗"得到一个干净的列表，再基于它做各种统计，代码会清晰很多。
- 写完以后试试自己 `print(build_report(csv_text))`，对着结果检查。
- 🎉 通关！你已经走完了 Python 入门的全部 30 关。接下来可以去找真实的小项目练手了。
