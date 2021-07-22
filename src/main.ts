import {createApp} from 'vue'
import App from './App.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {TippyDirective} from "@/lib/TippyDirective";

import {initIcons} from "@/icons";

initIcons()

let vue = createApp(App)
vue.component('fa', FontAwesomeIcon)
vue.directive('tippy', TippyDirective)
vue.mount('#app')
