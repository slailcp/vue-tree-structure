import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/MenuDialog',
  },
  {
    path: '/Menu',
    name: 'Menu',
    component: () => import('/src/views/Menu.vue'),
  },
  {
    path: '/MenuDialog',
    name: 'MenuDialog',
    component: () => import('/src/views/MenuDialog.vue'),
  },
  {
    path: '/MenuDialogUpdateTree',
    name: 'MenuDialogUpdateTree',
    component: () => import('/src/views/MenuDialogUpdateTree.vue'),
  },
  {
    path: '/MenuDialogShowLevel',
    name: 'MenuDialogShowLevel',
    component: () => import('/src/views/MenuDialogShowLevel.vue'),
  },
  {
    path: '/MenuDialogInitData',
    name: 'MenuDialogInitData',
    component: () => import('/src/views/MenuDialogInitData.vue'),
  },
  {
    path: '/MenuDialogScopeNode',
    name: 'MenuDialogScopeNode',
    component: () => import('/src/views/MenuDialogScopeNode.vue'),
  },
  {
    path: '/DepartMentSelector',
    name: 'DepartMentSelector',
    component: () => import('/src/views/DepartMentSelector.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
