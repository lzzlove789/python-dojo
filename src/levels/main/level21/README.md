# 第 21 关 · 类与对象

> 场景：银行系统需要"账户"：每个账户有户主和余额，能存钱、取钱，余额不足时要拒绝取款。

## 概念讲解

**类（class）** 是图纸，**对象（实例）** 是按图纸造出来的具体东西。类把"数据（属性）"和"操作数据的函数（方法）"打包在一起。

```python
class Dog:
    def __init__(self, name):      # 构造方法：创建对象时自动调用
        self.name = name           # 属性：存在对象自己身上

    def bark(self):                # 方法：第一个参数永远是 self
        return f"{self.name} 汪汪"

d = Dog("Rex")      # 创建对象，等于调用 __init__
print(d.bark())     # Rex 汪汪
```

- `self` 指"当前这个对象"，调用时 Python 自动传入，你不用手写。
- 属性属于每个对象自己：创建两个对象，它们的数据互不影响。
- 类名约定用**大驼峰**（`BankAccount`），函数和变量用小写下划线。

## 命令教学

```python
a = Dog("A")
b = Dog("B")
print(a.name, b.name)     # A B
```

## 本关任务

补全 `BankAccount`：

- [ ] `__init__`：保存 `owner` 和 `balance`（默认余额 0）
- [ ] `deposit(amount)`：余额增加
- [ ] `withdraw(amount)`：余额足够就扣款并返回 `True`；不够就不动余额，返回 `False`

## 小贴士

- 忘记写 `self.` 是新手最常见的错误：`balance = 1` 只是个局部变量，`self.balance = 1` 才是属性。
- 方法定义里必须有 `self`，否则调用时会报"参数个数不对"。
