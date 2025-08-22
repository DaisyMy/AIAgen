<template>
  <div class="stream-container">
    <button @click="startStream" :disabled="isStreaming">开始流式传输</button>
    <button @click="stopStream" :disabled="!isStreaming">停止</button>

    <div class="output-panel">
      <VueNodeRenderer
          v-for="(node, index) in renderedContent"
          :key="index"
          :node="node"
      />
      <div v-if="isLoading" class="loader">生成中...</div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, onMounted, getCurrentInstance} from "vue";
import {fetchEventSource} from '@microsoft/fetch-event-source';
import markdownIt from "markdown-it"
import {parseDocument} from "htmlparser2";
import DOMPurify from "dompurify";
import hljs from 'highlight.js';
import VueNodeRenderer from "@/components/VueNodeRenderer/index.vue";

const proxy = getCurrentInstance()
const mermaid = proxy.mermaid

const content = ref('');
const isStreaming = ref(false);
const isLoading = ref(false);
const controller = ref(null);


const md = new markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    console.log(lang)
    if (lang === 'mermaid') {
      return `<pre class="mermaid">${str}</pre>`
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
            hljs.highlight(str, {language: lang}).value +
            '</code></pre>';
      } catch (__) {
      }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})

// 渲染 Markdown
const renderedContent = computed(() => {
  return parseDocument(
      DOMPurify.sanitize(accumulatedMarkdown.value)
  ).children;
});

const accumulatedMarkdown = ref('')

const startStream = async () => {
  if (isStreaming.value) return;

  content.value = '';
  accumulatedMarkdown.value = '';
  isStreaming.value = true;
  isLoading.value = true;

  controller.value = new AbortController();

  try {
    await fetchEventSource('api/stream-md', {
      method: 'GET',
      headers: {'Accept': 'application/json'},
      signal: controller.value.signal,
      onopen(response) {
        if (response.ok) return;
        throw new Error(`Server error: ${response.status}`);
      },
      onmessage(event) {
        if (event.event === 'end') {
          isLoading.value = false;
          return;
        }

        try {
          const data = JSON.parse(event.data);
          content.value += data.content;
          // 使用 md 渲染 Markdown
          accumulatedMarkdown.value = md.render(content.value);
        } catch (e) {
          console.error('Parsing error:', e);
        }
      },
      onerror(err) {
        throw err;
      },
      onclose() {
        isStreaming.value = false;
        isLoading.value = false;
      }
    });
  } catch (err) {
    console.error('Fetch error:', err);
    isStreaming.value = false;
    isLoading.value = false;
  }
};

const stopStream = () => {
  if (controller.value) {
    controller.value.abort();
  }
  isStreaming.value = false;
  isLoading.value = false;
};

</script>


<style scoped>
.stream-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.output-panel {
  margin-top: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
  position: relative;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.markdown-content :deep(pre) {
  background: #f8f8f8;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.markdown-content :deep(table),
.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #3498db;
  padding-left: 15px;
  margin-left: 0;
  color: #555;
}

.loader {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>