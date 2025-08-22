<script setup>
import {ref, onMounted, nextTick} from 'vue'
import mermaid from 'mermaid'


const props = defineProps({
  value: {
    type: String,
  }
})

const mermaidRef = ref(null)

onMounted(async () => {
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: "loose",
    fontSize: 16
  })
  if (mermaidRef.value) {
    try{
      mermaidRef.value.innerHTML = props.value
      mermaid.init(undefined, mermaidRef.value)
    }catch (err){
      console.log(err)
    }

  }

})
</script>

<template>
  <div class="mermaid_node">
    <div ref="mermaidRef"></div>
  </div>
</template>

<style scoped>

</style>