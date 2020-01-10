import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import Editor from '../views/Editor.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/editor',
    name: 'editor',
    component: Editor,
  },
  {
    path: '/game',
    name: 'game',
    component: Game,
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
