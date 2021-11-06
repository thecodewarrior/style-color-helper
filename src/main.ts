import {createApp} from 'vue'
import App from './App.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {TippyDirective} from "@/lib/TippyDirective";
import * as VueRouter from 'vue-router'

import {initIcons} from "@/icons";
import FilterList from "@/components/views/FilterList.vue";
import FilterAddMenu from "@/components/views/FilterAddMenu.vue";
import FilterColorEditor from "@/components/views/FilterColorEditor.vue";
import FilterSaveLoad from "@/components/views/FilterSaveLoad.vue";

let history = VueRouter.createMemoryHistory()
let router = VueRouter.createRouter({
  history,
  routes: [
    {
      path: '/',
      component: FilterList,
      meta: {
        back: false
      },
    },
    {
      path: '/add',
      component: FilterAddMenu,
      meta: {
        back: true
      },
    },
    {
      path: '/color/:filterIndex/:parameterIndex',
      component: FilterColorEditor,
      props: true,
      meta: {
        back: true
      },
    },
    {
      path: '/save',
      component: FilterSaveLoad,
      meta: {
        back: true
      },
    }
  ]
})

initIcons()

let vue = createApp(App)
vue.use(router)
vue.component('fa', FontAwesomeIcon)
vue.directive('tippy', TippyDirective)
vue.mount('#app')
