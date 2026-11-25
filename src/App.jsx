import { useState } from "react"

const initialTasks = [
  { id: 1, title: "Préparer la démo du sprint", assignee: "Ada", done: false },
  { id: 2, title: "Relire la PR de Grace", assignee: "Ada", done: true },
  { id: 3, title: "Corriger le bug du formulaire", assignee: "Grace", done: false },
  { id: 4, title: "Maquetter la page projet", assignee: "Hedy", done: false },
  { id: 5, title: "Mettre à jour le README", assignee: "Grace", done: true },
];

function TaskItem({ task }) {
  return (
    <li>
      {task.title} <small>({task.assignee})</small>
    </li>
  );
}

function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)

  function toggleTask(id) {
    setTasks(tasks.map((task) => {
      if (task.id === id) {
        task.done = !task.done
      }
      return task
    }))
  }

  return (
    <section>
      <h2>Tâches</h2>
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <>
      <header className="container">
        <h1>Lovelace Factory</h1>
      </header>
      <main className="container">
        <TaskList />
      </main>
      <footer className="container">
        <small>Atelier hooks React · Ada Tech School</small>
      </footer>
    </>
  );
}
