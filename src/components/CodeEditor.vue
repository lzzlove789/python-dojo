<template>
  <div ref="host" class="code-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting, indentUnit } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "run"): void;
}>();

const host = ref<HTMLDivElement | null>(null);
let view: EditorView | null = null;

const gruvboxTheme = EditorView.theme(
  {
    "&": { height: "100%", backgroundColor: "var(--bg-darkest)", color: "var(--fg)" },
    ".cm-scroller": { fontFamily: "var(--font-mono)", fontSize: "14px", lineHeight: "1.6" },
    ".cm-content": { caretColor: "var(--fg-bright)" },
    ".cm-cursor": { borderLeftColor: "var(--fg-bright)" },
    ".cm-gutters": { backgroundColor: "var(--bg-darkest)", color: "var(--fg-dim)", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(80, 73, 69, 0.35)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(80, 73, 69, 0.35)" },
    "&.cm-focused": { outline: "none" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(131, 165, 152, 0.3)",
    },
  },
  { dark: true }
);

const gruvboxHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword], color: "#fb4934" },
  { tag: [t.string, t.special(t.string)], color: "#b8bb26" },
  { tag: [t.number, t.bool, t.null], color: "#d3869b" },
  { tag: t.comment, color: "#928374", fontStyle: "italic" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#fabd2f" },
  { tag: [t.definition(t.variableName), t.className], color: "#8ec07c" },
  { tag: t.self, color: "#fe8019" },
]);

onMounted(() => {
  view = new EditorView({
    parent: host.value!,
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        indentUnit.of("    "),
        python(),
        syntaxHighlighting(gruvboxHighlight),
        gruvboxTheme,
        keymap.of([
          { key: "Mod-Enter", run: () => (emit("run"), true) },
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) emit("update:modelValue", u.state.doc.toString());
        }),
      ],
    }),
  });
});

watch(
  () => props.modelValue,
  (v) => {
    if (view && v !== view.state.doc.toString()) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } });
    }
  }
);

onBeforeUnmount(() => view?.destroy());
</script>

<style scoped>
.code-editor {
  height: 100%;
  overflow: hidden;
}
.code-editor :deep(.cm-editor) {
  height: 100%;
}
</style>
