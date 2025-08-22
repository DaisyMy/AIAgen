import {createApp} from 'vue'
import './style.css'
import 'highlight.js/styles/atom-one-dark.css';
import App from './App.vue'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";


hljs.registerLanguage('javascript', javascript);
const app = createApp(App)

app.use(hljsVuePlugin).mount('#app')
