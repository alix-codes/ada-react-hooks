import { useState } from "react"

const initialTasks = [
  { id: 1, title: "Préparer la démo du sprint", assignee: "Ada", done: false },
  { id: 2, title: "Relire la PR de Grace", assignee: "Ada", done: true },
  { id: 3, title: "Corriger le bug du formulaire", assignee: "Grace", done: false },
  { id: 4, title: "Maquetter la page projet", assignee: "Hedy", done: false },
  { id: 5, title: "Mettre à jour le README", assignee: "Grace", done: true },
];

function TaskItem({ task, onToggle }) {
  return (
    <li className="flex items-baseline">
      <label>
        <input type="checkbox" checked={task.done} onChange={onToggle} />
        {task.done ? <s>{task.title}</s> : task.title}
      </label>
      <small className="ml-2">({task.assignee})</small>
    </li>
  );
}

function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTitle, setNewTitle] = useState("")

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
      <form role="group" onSubmit={() => {}}>
        <input placeholder="Nouvelle tâche" value={newTitle} onChange={(event) => setNewTitle(event.target.value)}  />
        <button>Ajouter</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
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
