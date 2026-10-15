# 第 19 关 · 作用域与闭包

> 场景：你要做一个"计数器工厂"：每次调用工厂得到一个独立的计数器，互不干扰。

## 概念讲解

**作用域**决定变量在哪里可见。Python 按 LEGB 顺序查找：

1. **L**ocal：当前函数内
2. **E**nclosing：外层函数
3. **G**lobal：模块（文件）级
4. **B**uilt-in：内置名字（`len`、`print` ...）

函数里对变量**赋值**，默认就是新建一个局部变量，不会改到外面的同名变量。

**闭包**：内部函数引用了外层函数的变量，即使外层函数已经执行完，这些变量依然被"记住"：

```python
def outer():
    msg = "hi"
    def inner():
        return msg
    return inner      # 注意：返回函数本身，不带括号

f = outer()
print(f())            # hi
```

如果内部函数想**修改**（而不只是读取）外层变量，要声明 `nonlocal`：

```python
def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc
```

每次调用 `make_counter()` 都会产生一份独立的 `count`。

## 本关任务

- [ ] `make_counter()` 返回计数函数，依次返回 1、2、3……
- [ ] 两个计数器互相独立
- [ ] `make_multiplier(n)` 返回一个"乘以 n"的函数
- [ ] 用 `nonlocal`，不要用 `global`

## 小贴士

- 滥用 `global` 会让代码难以推理，闭包（或下一章的类）是更好的状态封装方式。
- 闭包是装饰器的基础，下一关马上用到。
