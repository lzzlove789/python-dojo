import type { LevelType } from "../../../core/types";

const level: LevelType = {
  key: "level22",
  title: "继承与 super",
  chapter: 3,
  chapterTitle: "第三章 · 函数与面向对象",
  scenario: "动物园系统里已经有了 Animal 基类，你要派生出狗、猫，还有一只会长大的小狗。",
  starter:
    'class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return "..."\n\n    def describe(self):\n        return f"{self.name}: {self.speak()}"\n\n\n# Dog 继承 Animal，speak 返回 "汪汪"\n\n# Cat 继承 Animal，speak 返回 "喵喵"\n\n# Puppy 继承 Dog：\n#   __init__(self, name, age) —— 用 super().__init__(name) 初始化名字，再保存 age\n#   speak() —— 在父类叫声后面加 "!"，例如 "汪汪!"\n',
  hint: "class Dog(Animal): 就是继承；子类只需覆盖想改的方法。Puppy 里用 super().__init__(name) 调用父类构造，用 super().speak() 拿到父类的叫声。",
  answer: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def describe(self):
        return f"{self.name}: {self.speak()}"


class Dog(Animal):
    def speak(self):
        return "汪汪"


class Cat(Animal):
    def speak(self):
        return "喵喵"


class Puppy(Dog):
    def __init__(self, name, age):
        super().__init__(name)
        self.age = age

    def speak(self):
        return super().speak() + "!"
`,
  checks: [
    { type: "noError", label: "代码运行没有报错" },
    { type: "exprEquals", expr: 'Dog("Rex").describe()', equals: "Rex: 汪汪", label: "Dog 的叫声是 汪汪，describe 沿用父类" },
    { type: "exprEquals", expr: 'Cat("Tom").describe()', equals: "Tom: 喵喵", label: "Cat 的叫声是 喵喵" },
    { type: "exprEquals", expr: 'Puppy("Bit", 1).speak()', equals: "汪汪!", label: "Puppy 的叫声是 汪汪!" },
    { type: "exprEquals", expr: 'Puppy("Bit", 1).describe()', equals: "Bit: 汪汪!", label: "Puppy 的 describe 用到了自己的 speak" },
    { type: "exprEquals", expr: '[Puppy("Bit", 3).name, Puppy("Bit", 3).age]', equals: ["Bit", 3], label: "Puppy 同时有 name 和 age" },
    { type: "exprEquals", expr: 'isinstance(Puppy("a", 1), Animal)', equals: true, label: "Puppy 也是 Animal（继承链）" },
    { type: "uses", calls: ["super().__init__"], label: "用 super().__init__ 初始化父类" },
  ],
  examples: [
    { code: "class A:\n    def hi(self):\n        return 'A'\n\nclass B(A):\n    pass\n\nprint(B().hi())\nprint(issubclass(B, A))", description: "子类自动获得父类的方法" },
    { code: "class A:\n    def hi(self):\n        return 'A'\n\nclass B(A):\n    def hi(self):\n        return super().hi() + 'B'\n\nprint(B().hi())", description: "覆盖方法，并用 super() 复用父类实现" },
  ],
};

export default level;
