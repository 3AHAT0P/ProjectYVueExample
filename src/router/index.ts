import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Game from '../views/Game.vue';
import LevelCreator from '../views/LevelCreator.vue';
import FlipbookCreator from '../views/FlipbookCreator.vue';
import GameObjectCreator from '../views/GameObjectCreator.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/level-creator',
    name: 'level-creator',
    component: LevelCreator,
  },
  {
    path: '/game-object-creator',
    name: 'game-object-creator',
    component: GameObjectCreator,
  },
  {
    path: '/flipbook-creator',
    name: 'flipbook-creator',
    component: FlipbookCreator,
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
