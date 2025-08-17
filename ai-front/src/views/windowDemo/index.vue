<template>
  <div class="sse-container">
    <div class="sse-header">
      <el-button @click="toggleSSE" :type="isConnected ? 'danger' : 'success'">
        {{ isConnected ? "断开连接" : "连接 SSE" }}
      </el-button>
    </div>

    <div class="sse-status">
      <p>连接状态: {{ isConnected ? "已连接" : "未连接" }}</p>
      <p v-if="isConnected">接收中... ({{ receivedMessages }} 条消息)</p>
    </div>

    <div class="markdown-body">
      <VueNodeRenderer
          v-for="(node, index) in renderedContent"
          :key="index"
          :node="node"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed, defineComponent, h} from "vue";
import {marked} from "marked";
import {parseDocument} from "htmlparser2";
import DOMPurify from "dompurify";
import VueNodeRenderer from "@/components/VueNodeRenderer/index.vue";

// 状态管理
const isConnected = ref(false);
const receivedMessages = ref(0);
const accumulatedMarkdown = ref(""); // 累积markdown内容

let mockInterval = null;
let messageId = 0;


// 配置 marked 库
marked.setOptions({
  breaks: true, // 转换段落内的换行符为 <br>
  gfm: true, // 启用 GitHub 风格的 markdown
  smartypants: true, // 使用智能引号和其他排版符号
});

// 解析和格式化 SSE 数据
const parseSSEData = (content) => {
  try {
    // 尝试解析 JSON 内容
    const {event, answer} = JSON.parse(content);
    console.log(event);
    // 只处理 message 事件
    if (event === "message") {
      // 确保 answer 存在，否则显示提示信息
      const answerContent = answer || "";
      accumulatedMarkdown.value += answerContent;
    }
    if (event === "message_end") {
      disconnectSSE();
    }
    return accumulatedMarkdown.value;
  } catch (error) {
    // 解析错误，记录错误并返回友好提示
    console.error("解析SSE数据失败:", error);
  }
};

// HTML 到 AST 的转换：使用 htmlparser2
const renderedContent = computed(() => {
  return parseDocument(
      DOMPurify.sanitize(marked.parse(accumulatedMarkdown.value))
  ).children;
});

// 连接/断开 SSE
const toggleSSE = () => {
  if (isConnected.value) {
    disconnectSSE();
  } else {
    connectSSE();
  }
};

// 连接 SSE
const connectSSE = () => {
  isConnected.value = true;
  receivedMessages.value = 0;
  accumulatedMarkdown.value = ""; // 重置累积的markdown
  messageId = 0;
  let currentData = 123;

  // 模拟 SSE 连接 - 随机发送间隔
  const sendNextMessage = () => {
    if (messageId < currentData.length) {
      const data = JSON.stringify(currentData[messageId]);
      // 解析当前消息并追加到内容中
      const parsedContent = parseSSEData(data);
      if (parsedContent) {
        receivedMessages.value++;
      }
      messageId++;

      mockInterval = setTimeout(sendNextMessage, 100);
    }
  };

  // 发送第一条消息
  sendNextMessage();
};

// 断开 SSE
const disconnectSSE = () => {
  isConnected.value = false;
  if (mockInterval) {
    clearTimeout(mockInterval);
    mockInterval = null;
  }
};

// 组件挂载时
onMounted(() => {
  // 自动连接 SSE
  connectSSE();
});

// 组件卸载时
onUnmounted(() => {
  disconnectSSE();
});
</script>

<style scoped>
.sse-container {
  max-width: 600px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>