<template>
  <!-- 文本节点直接渲染内容 -->

  <template v-if="node.type === 'text'">
    {{ node.data }}

  </template>

  <!-- 图片节点使用 el-image 组件 -->

  <template v-else-if="isImageNode">

    <!--    <el-image-->
    <!--        :src="node.attribs.src + '?x-oss-process=image/resize,w_400/format,jpg'"-->
    <!--        :alt="node.attribs.alt || '图片'"-->
    <!--        :preview-src-list="[node.attribs.src]"-->
    <!--        preview-teleported-->
    <!--        class="w-30% block!"-->
    <!--    />-->
    <div> img</div>

  </template>

  <!-- 其他非文本节点渲染对应标签 + 递归子节点 -->

  <template v-else>

    <component :is="node.tagName" v-bind="node.attribs">

      <VueNodeRenderer
          v-for="(child, index) in node.children"
          :key="index"
          :node="child"
      />

    </component>

  </template>
</template>
<script>
export default {
  name: 'VueNodeRenderer'
}
</script>
<script setup>
import {computed} from 'vue'

// 定义组件属性
const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

// 判断是否为图片节点
const isImageNode = computed(() => {
  return props.node.tagName?.toLowerCase() === 'img'
})

// 计算图片样式（可根据需要调整）
const imageStyle = computed(() => {
  const style = {}
  // 传递原img标签的宽高属性
  if (props.node.attribs.width) style.width = props.node.attribs.width
  if (props.node.attribs.height) style.height = props.node.attribs.height
  return style
})
</script>