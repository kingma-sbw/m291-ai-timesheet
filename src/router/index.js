import { createRouter, createWebHistory } from 'vue-router'
import StudentList from '../views/StudentList.vue'
import TimesheetView from '../views/TimesheetView.vue'
import NewEntry from '../views/NewEntry.vue'

const routes = [
  {
    path: '/',
    name: 'StudentList',
    component: StudentList
  },
  {
    path: '/timesheet/:studentId',
    name: 'TimesheetView',
    component: TimesheetView,
    props: true
  },
  {
    path: '/new-entry/:studentId',
    name: 'NewEntry',
    component: NewEntry,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router