import { useEffect, useRef, useState } from "react"

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
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    fetch("/tasks.json")
      .then(res => {
        if (!res.ok) {
          throw new Error("Network error")
        }
        else return res.json()
      })
      .then(data => setTasks(data))
      .catch((error) => setError(error.message))
      .finally(() => setIsLoading(false))
  }, [])

  const totalRemaining = tasks.filter(task => !task.done).length

  function toggleTask(id) {
    setTasks(tasks.map((task) => {
      if (task.id === id) {
        task.done = !task.done
      }
      return task
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (newTitle === "") {
      return
    }
    setTasks([...tasks, { id: Date.now(), title: newTitle, assignee: "Ada", done: false }])
    setNewTitle("")
    inputRef.current.focus()
  }

  if (error) {
    return <p className="bg-red-50 p-2">{error}</p>
  }

  return (
    <section>
      <h2>Tâches</h2>
      <small>{totalRemaining} tâche(s) restante(s)</small>
      <form role="group" onSubmit={handleSubmit}>
        <input ref={inputRef} placeholder="Nouvelle tâche" value={newTitle} onChange={(event) => setNewTitle(event.target.value)}  />
        <button>Ajouter</button>
      </form>
      {isLoading ? "Tâches en chargement..." : (
        <ul>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
          ))}
        </ul>
      )}
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
