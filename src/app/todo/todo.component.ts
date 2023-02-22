import { Component, OnDestroy, OnInit } from '@angular/core'
import { remult } from 'remult'
import { Task } from '../../shared/task'
import { TasksController } from '../../shared/TasksController'

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html'
})
export class TodoComponent implements OnInit, OnDestroy {
  tasks: Task[] = []
  taskRepo = remult.repo(Task)
  ngOnInit() {
    this.unSub = this.taskRepo
      .liveQuery({
        where: {
          completed: undefined
        }
      })
      .subscribe(({ items }) => (this.tasks = items))
  }
  unSub = () => {}
  ngOnDestroy() {
    this.unSub()
  }

  newTaskTitle = ''
  async addTask() {
    try {
      await this.taskRepo.insert({
        id: this.tasks.length,
        title: this.newTaskTitle,
        completed: false
      })
      this.newTaskTitle = ''
    } catch (error: any) {
      alert(error.message)
    }
  }

  async saveTask(task: Task) {
    try {
      await this.taskRepo.save(task)
    } catch (error: any) {
      alert(error.message)
    }
  }

  async deleteTask(task: Task) {
    try {
      await this.taskRepo.delete(task)
      this.tasks = this.tasks.filter((t) => t != task)
    } catch (error: any) {
      alert(error.message)
    }
  }

  async setAllCompleted(completed: boolean) {
    await TasksController.setAllCompleted(completed)
  }
}
