# 第 22 关 · 继承与 super

> 场景：动物园系统里已经有了 Animal 基类，你要派生出狗、猫，还有一只会长大的小狗。

## 概念讲解

**继承**让一个类（子类）直接获得另一个类（父类）的属性和方法，避免重复代码：

```python
class Dog(Animal):      # Dog 继承 Animal
    def speak(self):    # 覆盖（override）父类的同名方法
        return "汪汪"
```

- 子类没有的方法，会沿着继承链去父类里找。
- 子类写同名方法就是**覆盖**。
- `isinstance(obj, Animal)` 判断对象是不是某个类（含其子类）的实例。

**`super()`** 表示"我的父类"。常用于两个场合：

```python
class Puppy(Dog):
    def __init__(self, name, age):
        super().__init__(name)      # 让父类去初始化 name
        self.age = age

    def speak(self):
        return super().speak() + "!"   # 复用父类的实现再加工
```

**多态**：`describe()` 里调用的是 `self.speak()`，`self` 是谁，就用谁的 `speak`。所以同一份 `describe` 代码，对 Dog、Cat、Puppy 都能给出各自的结果。

## 本关任务

`Animal` 已写好，你来写：

- [ ] `Dog(Animal)`：`speak` 返回 `"汪汪"`
- [ ] `Cat(Animal)`：`speak` 返回 `"喵喵"`
- [ ] `Puppy(Dog)`：`__init__(name, age)` 用 `super().__init__(name)`；`speak` 在父类叫声后加 `"!"`

## 小贴士

- 子类写了 `__init__` 却忘记调用 `super().__init__()`，父类里设置的属性就不会存在。
- Python 支持多继承，但先把单继承用熟。
