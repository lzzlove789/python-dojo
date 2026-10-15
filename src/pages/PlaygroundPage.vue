<template>
  <div class="playground-page">
    <div class="playground-main">
      <div class="toolbar">
        <span class="toolbar-title">练功场 · 自由编写并运行任何 Python 代码</span>
        <span class="toolbar-spacer"></span>
        <button class="ghost-btn" @click="onClear">清空</button>
        <button class="run-btn" :disabled="running" @click="onRun">
          ▶ 运行 <span class="run-key">Ctrl+Enter</span>
        </button>
      </div>
      <div class="editor-wrap">
        <CodeEditor v-model="code" @run="onRun" />
      </div>
      <div class="output-wrap">
        <OutputPanel :result="result" :running="running" :status="status" />
      </div>
    </div>
    <div class="cheatsheet">
      <h3 class="cheatsheet-title">语法速查表</h3>
      <p class="cheat-tip">点击任意一行，把它加到编辑器里</p>
      <div v-for="group in cheatsheet" :key="group.category" class="cheat-group">
        <div class="cheat-category" :class="'color-' + group.color">{{ group.category }}</div>
        <table class="cheat-table">
          <tbody>
            <tr v-for="(item, i) in group.items" :key="i" @click="insertSnippet(item.code)">
              <td class="cheat-cmd">{{ item.code }}</td>
              <td class="cheat-desc">{{ item.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { useGlobalStore } from "../stores/global";
import { getRunner } from "../core/pyRunner";
import { createDraftSaver } from "../core/draftSaver";
import type { RunnerStatus } from "../core/pyRunner";
import type { RunResult } from "../core/types";
import CodeEditor from "../components/CodeEditor.vue";
import OutputPanel from "../components/OutputPanel.vue";

const DRAFT_KEY = "playground";
const WELCOME = '# 欢迎来到练功场！这里没有任务，想写什么就写什么。\n# 右边是语法速查表，点一行就能加进来。\n\nprint("Hello, Python!")\n';

const store = useGlobalStore();
const runner = getRunner();

const code = ref(store.drafts[DRAFT_KEY] ?? WELCOME);
const result = ref<RunResult | null>(null);
const running = ref(false);
const status = ref<RunnerStatus>(runner.status);
runner.onStatus = (s) => (status.value = s);

// 防抖保存，离开页面时立即写入
const drafts = createDraftSaver((key, value) => store.saveDraft(key, value));
watch(code, (v) => drafts.queue(DRAFT_KEY, v));
const flushDrafts = () => drafts.flush();
window.addEventListener("pagehide", flushDrafts);
onBeforeUnmount(() => {
  flushDrafts();
  window.removeEventListener("pagehide", flushDrafts);
});

async function onRun() {
  if (running.value) return;
  running.value = true;
  try {
    result.value = await runner.run({ code: code.value });
  } finally {
    running.value = false;
  }
}

function onClear() {
  code.value = "";
  result.value = null;
}

function insertSnippet(snippet: string) {
  const base = code.value.replace(/\s+$/, "");
  code.value = (base ? base + "\n" : "") + snippet + "\n";
}

const cheatsheet = [
  {
    category: "基础",
    color: "green",
    items: [
      { code: 'print("hi", 1 + 2)', desc: "输出" },
      { code: "x = 10", desc: "变量赋值" },
      { code: "type(x)", desc: "查看类型" },
      { code: 'name = input("名字：")', desc: "读取输入（得到字符串）" },
      { code: "int('42') + float('1.5')", desc: "类型转换" },
      { code: 'f"{x} 的两倍是 {x * 2}"', desc: "f-string 格式化" },
      { code: "7 // 2, 7 % 2, 2 ** 10", desc: "整除、取余、幂" },
    ],
  },
  {
    category: "流程控制",
    color: "yellow",
    items: [
      { code: "if x > 5:\n    print('大')\nelif x == 5:\n    print('等')\nelse:\n    print('小')", desc: "条件判断" },
      { code: "for i in range(5):\n    print(i)", desc: "for 循环" },
      { code: "while x > 0:\n    x -= 1", desc: "while 循环" },
      { code: "break / continue", desc: "跳出 / 跳过本轮" },
    ],
  },
  {
    category: "数据结构",
    color: "orange",
    items: [
      { code: "lst = [3, 1, 2]", desc: "列表" },
      { code: "lst.append(4); lst.sort()", desc: "添加、排序" },
      { code: "lst[1:3], lst[::-1]", desc: "切片、倒序" },
      { code: 'd = {"a": 1}', desc: "字典" },
      { code: 'd.get("b", 0)', desc: "安全取值" },
      { code: "s = {1, 2, 2}", desc: "集合（去重）" },
      { code: "[n * n for n in range(5) if n % 2 == 0]", desc: "列表推导式" },
      { code: "sorted(lst, key=lambda v: -v)", desc: "排序（自定义 key）" },
      { code: "list(enumerate(lst)), list(zip(lst, lst))", desc: "enumerate / zip" },
    ],
  },
  {
    category: "函数与类",
    color: "blue",
    items: [
      { code: 'def greet(name="世界"):\n    return f"你好，{name}"', desc: "函数与默认参数" },
      { code: "def f(*args, **kwargs):\n    ...", desc: "任意参数" },
      { code: "class Dog:\n    def __init__(self, name):\n        self.name = name", desc: "类与构造方法" },
      { code: "class Puppy(Dog):\n    def __init__(self, name):\n        super().__init__(name)", desc: "继承与 super" },
      { code: "def gen(n):\n    for i in range(n):\n        yield i", desc: "生成器" },
    ],
  },
  {
    category: "工程实战",
    color: "red",
    items: [
      { code: "try:\n    1 / 0\nexcept ZeroDivisionError as e:\n    print(e)", desc: "异常处理" },
      { code: 'with open("/tmp/a.txt", "w") as f:\n    f.write("hi")', desc: "写文件（内存虚拟磁盘）" },
      { code: "import json\njson.dumps({'a': 1}, ensure_ascii=False)", desc: "JSON 序列化" },
      { code: "import re\nre.findall(r'\\d+', 'a1b22')", desc: "正则" },
      { code: "from collections import Counter\nCounter('banana')", desc: "标准库：Counter" },
      { code: "import math\nmath.sqrt(16)", desc: "标准库：math" },
    ],
  },
];
</script>

<style scoped>
.playground-page {
  display: flex;
  gap: var(--ld-sp-5);
  height: 100%;
  padding: var(--ld-sp-5) var(--ld-sp-6);
  overflow: hidden;
}

.playground-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: var(--ld-panel-border);
  border-radius: var(--ld-content-radius);
  background: var(--bg-dark);
  box-shadow: var(--ld-shadow-panel);
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--bg-light);
  flex-shrink: 0;
}

.toolbar-title {
  color: var(--fg-dim);
  font-size: 12px;
}

.toolbar-spacer {
  flex: 1;
}

.ghost-btn {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid var(--bg-light);
  border-radius: 4px;
  color: var(--fg-dim);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
}

.ghost-btn:hover {
  color: var(--fg);
  border-color: var(--fg-dim);
}

.run-btn {
  padding: 6px 16px;
  background: var(--green);
  border: none;
  border-radius: 4px;
  color: var(--bg-darkest);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.run-key {
  margin-left: 6px;
  font-size: 11px;
  font-weight: normal;
  opacity: 0.7;
}

.editor-wrap {
  flex: 3;
  min-height: 0;
}

.output-wrap {
  flex: 2;
  min-height: 0;
}

.cheatsheet {
  width: 360px;
  flex-shrink: 0;
  background: var(--bg-dark);
  border: var(--ld-panel-border);
  border-radius: var(--ld-radius-lg);
  box-shadow: var(--ld-shadow-panel);
  overflow: auto;
  padding: 22px 22px 26px;
}

.cheatsheet-title {
  color: var(--orange);
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: 2px;
  margin: 0 0 8px;
}

.cheat-tip {
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--bg-light);
  color: var(--fg-dim);
  font-size: 12px;
}

.cheat-group {
  margin-bottom: 24px;
}

.cheat-category {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 1px;
  padding: 5px 10px;
  border-left: 3px solid;
  margin-bottom: 10px;
}

.color-green { color: var(--green); border-left-color: var(--green); }
.color-yellow { color: var(--yellow); border-left-color: var(--yellow); }
.color-orange { color: var(--orange); border-left-color: var(--orange); }
.color-blue { color: var(--blue); border-left-color: var(--blue); }
.color-red { color: var(--red); border-left-color: var(--red); }

.cheat-table {
  width: 100%;
  border-collapse: collapse;
}

.cheat-table tr {
  cursor: pointer;
  transition: background 0.15s;
}

.cheat-table tr:hover {
  background: var(--bg-mid);
}

.cheat-cmd {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--aqua);
  padding: 6px 8px 6px 12px;
  white-space: pre-wrap;
  word-break: break-all;
  vertical-align: top;
}

.cheat-desc {
  font-size: 13px;
  color: var(--fg-dim);
  padding: 6px 8px;
  vertical-align: top;
  min-width: 90px;
}

@media (max-width: 899px) {
  .playground-page {
    flex-direction: column;
    overflow-y: auto;
  }

  .playground-main {
    min-height: 480px;
  }

  .cheatsheet {
    width: 100%;
  }
}
</style>
