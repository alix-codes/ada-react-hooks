# Atelier : les hooks React

Pendant cet atelier, on fait évoluer **une seule application** : la liste de tâches de Lovelace Factory. À chaque partie :

1. on découvre un hook : à quoi il sert, avec des exemples ;
2. vous l'utilisez vous-même dans l'application, en suivant les étapes, pendant un temps donné ;
3. on fait la correction ensemble. Après la correction, mettez votre code à jour pour repartir tous du même point.

Les hooks vus aujourd'hui : `useState`, `useEffect`, `useRef`, `useContext`, `useMemo` et `useCallback`.

---

## 0. Démarrer le projet

### Prérequis

Il vous faut **Node.js en version 20.19 ou plus récente**. Vérifiez dans un terminal :

```bash
node -v
```

Si la version est plus ancienne, installez la dernière version LTS depuis [nodejs.org](https://nodejs.org).

## 1. `useState` : se souvenir d'une valeur

### À quoi ça sert

Un composant React est une **fonction**. Chaque fois que React doit mettre à jour l'affichage, il **rappelle cette fonction**. On appelle ça un **rendu**.

Une variable normale ne suffit donc pas :

```jsx
function Menu() {
  let isOpen = false;

  return (
    <button onClick={() => { isOpen = !isOpen; }}>
      {isOpen ? "Fermer" : "Ouvrir"}
    </button>
  );
}
```

Quand on clique, `isOpen` change bien, mais :

- React n'est pas prévenu, donc il ne refait pas de rendu ;
- même s'il en refaisait un, la ligne `let isOpen = false` remettrait la valeur à `false`.

`useState` règle les deux problèmes : React garde la valeur en mémoire d'un rendu à l'autre, et refait un rendu quand elle change.

```jsx
import { useState } from "react";

function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  //     valeur   fonction     valeur de départ
  //     actuelle pour la changer

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? "Fermer" : "Ouvrir"}
    </button>
  );
}
```

### Cas d'usage fréquents

- une case cochée ou non ;
- le texte tapé dans un champ ;
- l'onglet actif, une modale ouverte ou fermée ;
- une liste d'éléments qu'on peut modifier.

### Un champ « contrôlé »

On relie la valeur d'un champ à un état : React affiche ce que contient l'état, et chaque frappe met l'état à jour.

```jsx
const [name, setName] = useState("");

<input value={name} onChange={(event) => setName(event.target.value)} />
```

### Règle importante : ne jamais modifier un état directement

React compare l'ancienne et la nouvelle valeur. Pour un tableau ou un objet, il regarde si c'est **le même** tableau ou objet, pas si son contenu a changé. Si on modifie le tableau existant (avec `push`, par exemple), React croit que rien n'a changé et ne refait pas de rendu.

Il faut toujours **créer un nouveau tableau**. Exemple avec une liste de courses :

```jsx
const [items, setItems] = useState([
  { id: 1, name: "Pain", bought: false },
]);

// Ajouter un élément
setItems([...items, { id: 2, name: "Lait", bought: false }]);

// Supprimer un élément
setItems(items.filter((item) => item.id !== 1));

// Modifier un élément
setItems(items.map((item) =>
  item.id === 1 ? { ...item, bought: true } : item
));
```

### Un état, ou un simple calcul ?

Si une valeur peut se **calculer** à partir d'un état existant, ce n'est pas un nouvel état :

```jsx
const boughtCount = items.filter((item) => item.bought).length; // pas de useState
```

### Exercice : cocher et ajouter des tâches (15 min)

Toutes les modifications se font dans `src/App.jsx`.

**Partie A : cocher une tâche**

1. En haut du fichier, importez `useState` : `import { useState } from "react";`
2. Dans `TaskList`, remplacez `const tasks = initialTasks;` par un état dont la valeur de départ est `initialTasks`.
3. Toujours dans `TaskList`, écrivez une fonction `toggleTask(id)` qui inverse la valeur `done` de la tâche qui a cet `id`. Ne modifiez pas le tableau existant : créez-en un nouveau.
4. Passez cette fonction à chaque `TaskItem` dans une prop `onToggle`.
5. Dans `TaskItem`, ajoutez une case à cocher dans un `<label>` :

   ```jsx
   <label>
     <input type="checkbox" checked={task.done} onChange={...} />
     {task.title}
   </label>
   ```

   Quand on coche, la case doit appeler `onToggle` avec l'`id` de la tâche.
6. Si la tâche est faite, affichez son titre barré avec la balise `<s>` : `<s>{task.title}</s>`.

**Partie B : ajouter une tâche**

1. Dans `TaskList`, créez un état `newTitle` pour le texte du champ, vide au départ.
2. Au-dessus de la liste, ajoutez un formulaire. Avec `role="group"`, Pico colle le champ et le bouton :

   ```jsx
   <form role="group" onSubmit={...}>
     <input placeholder="Nouvelle tâche" ... />
     <button>Ajouter</button>
   </form>
   ```

3. Faites du champ un champ contrôlé, relié à `newTitle`.
4. Quand le formulaire est envoyé :
   - appelez `event.preventDefault()`, sinon le navigateur recharge la page ;
   - si le champ est vide, ne faites rien ;
   - sinon, ajoutez une tâche `{ id: Date.now(), title: newTitle, assignee: "Ada", done: false }` **sans utiliser `push`** ;
   - videz le champ.

**Bonus :** affichez « 3 tâches restantes » sous le titre `<h2>`, **sans créer de nouvel état**.

### Correction en direct

---

## 2. `useEffect` : charger des données

### À quoi ça sert

Un rendu doit seulement **calculer ce qu'on affiche**. Mais parfois, un composant doit aussi agir sur le monde **en dehors de React** : appeler une API, changer le titre de l'onglet, écouter le clavier… C'est le rôle de `useEffect`.

```jsx
import { useEffect } from "react";

useEffect(() => {
  // code exécuté APRÈS l'affichage
}, [/* dépendances */]);
```

### Le tableau de dépendances

C'est lui qui décide **quand** l'effet se relance :

| Écriture | L'effet s'exécute… |
|---|---|
| `useEffect(fn)` | après **chaque** rendu |
| `useEffect(fn, [])` | une seule fois, après le **premier** affichage |
| `useEffect(fn, [a, b])` | au premier affichage, puis chaque fois que `a` ou `b` change |

Exemple : mettre à jour le titre de l'onglet quand un compteur change.

```jsx
useEffect(() => {
  document.title = `${unreadCount} messages non lus`;
}, [unreadCount]);
```

### Le nettoyage

Si l'effet renvoie une fonction, React l'appelle avant de relancer l'effet, ou quand le composant disparaît. Ça sert à arrêter ce qu'on a démarré :

```jsx
useEffect(() => {
  function handleKeyDown(event) {
    console.log("Touche :", event.key);
  }
  window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Charger des données avec `fetch`

La fonction passée à `useEffect` ne peut pas être `async`. On déclare donc une fonction `async` à l'intérieur, puis on l'appelle :

```jsx
const [users, setUsers] = useState([]);

useEffect(() => {
  async function loadUsers() {
    const response = await fetch("/users.json");
    const data = await response.json();
    setUsers(data);
  }
  loadUsers();
}, []);
```

### Cas d'usage fréquents

- charger des données depuis une API ;
- écouter un événement de la fenêtre (clavier, redimensionnement…) ;
- démarrer un minuteur ;
- changer le titre de l'onglet.

### Quand ne PAS utiliser `useEffect`

- Pour calculer une valeur à partir d'un état : on la calcule directement dans le composant.
- Pour réagir à un clic : on met le code dans la fonction appelée par le clic.

### Exercice : charger les tâches depuis un fichier JSON (12 min)

1. Créez le fichier `public/tasks.json` avec ce contenu :

   ```json
   [
     { "id": 1, "title": "Préparer la démo du sprint", "assignee": "Ada", "done": false },
     { "id": 2, "title": "Relire la PR de Grace", "assignee": "Ada", "done": true },
     { "id": 3, "title": "Corriger le bug du formulaire", "assignee": "Grace", "done": false },
     { "id": 4, "title": "Maquetter la page projet", "assignee": "Hedy", "done": false },
     { "id": 5, "title": "Mettre à jour le README", "assignee": "Grace", "done": true }
   ]
   ```

   Vérifiez qu'il est accessible : ouvrez http://localhost:5173/tasks.json dans le navigateur.

2. Dans `App.jsx`, supprimez la constante `initialTasks`. L'état `tasks` de `TaskList` démarre maintenant avec un tableau vide.
3. Importez `useEffect`. Dans `TaskList`, ajoutez un effet qui charge `/tasks.json` avec `fetch` et range le résultat dans `tasks`. Il ne doit s'exécuter qu'**une seule fois**, au premier affichage.
4. Ajoutez un état `isLoading`, à `true` au départ. Passez-le à `false` quand les tâches sont chargées. Tant qu'il vaut `true`, affichez `<p>Chargement des tâches…</p>` à la place de la liste.
5. **Expérience :** ouvrez les outils de développement du navigateur, onglet **Réseau** (Network), filtre **Fetch/XHR**. Rechargez la page : combien de requêtes vers `tasks.json` ? Retirez maintenant le tableau `[]` de votre effet et regardez l'onglet Réseau. Que se passe-t-il, et pourquoi ? Remettez vite le `[]` !

**Bonus :** si la requête échoue, affichez un message d'erreur. Pour tester, changez temporairement l'adresse en `/taches.json`. Indice : `response.ok` vaut `false` quand le serveur répond par une erreur.

Remarque : les tâches que vous ajoutez disparaissent quand vous rechargez la page. C'est normal, puisqu'on relit le fichier JSON à chaque fois et qu'aucun serveur n'enregistre les nouvelles tâches.

### Correction en direct

---

## 3. `useRef` : accéder à un élément de la page

### À quoi ça sert

`useRef` crée une petite boîte dont le contenu, `ref.current`, **reste le même d'un rendu à l'autre**. La différence avec un état : changer `ref.current` **ne provoque pas** de nouveau rendu.

L'usage le plus courant est de garder un lien vers un élément HTML :

```jsx
import { useRef } from "react";

function SearchBox() {
  const inputRef = useRef(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Rechercher</button>
    </>
  );
}
```

Une fois le composant affiché, React met l'élément `<input>` dans `inputRef.current`.

### Cas d'usage fréquents

- donner le focus à un champ ;
- faire défiler la page jusqu'à un élément ;
- mesurer la taille d'un élément ;
- garder une valeur qui ne doit pas déclencher de rendu, comme l'identifiant d'un minuteur.

### Exercice : garder le curseur dans le champ (5 min)

1. Ajoutez une tâche en **cliquant** sur le bouton « Ajouter », et non avec la touche Entrée. Le curseur n'est plus dans le champ : il faut recliquer dedans pour taper la tâche suivante.
2. Avec `useRef`, faites en sorte qu'après chaque ajout, le curseur revienne dans le champ « Nouvelle tâche ».

**Bonus :** donnez aussi le focus au champ dès l'ouverture de la page.

### Correction en direct

---

## 4. `useContext` : partager une valeur dans toute l'application

### À quoi ça sert

Parfois, une même valeur est utile à beaucoup de composants, parfois très loin dans l'arbre. La faire passer en props à chaque niveau devient pénible. Des composants reçoivent une prop dont ils ne se servent pas, juste pour la transmettre plus bas : c'est ce qu'on appelle le **prop drilling**.

Un **contexte** rend une valeur disponible pour tous les composants qui se trouvent à l'intérieur de son fournisseur. Il y a trois étapes.

**1. Créer le contexte**, en dehors des composants :

```jsx
import { createContext, useContext } from "react";

const ThemeContext = createContext("light"); // valeur par défaut
```

**2. Fournir une valeur**, autour des composants qui en ont besoin :

```jsx
function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}
```

**3. Lire la valeur**, dans n'importe quel composant à l'intérieur, sans props :

```jsx
function Button() {
  const theme = useContext(ThemeContext);
  return <button>Thème actuel : {theme}</button>;
}
```

Quand la valeur du fournisseur change, tous les composants qui la lisent se mettent à jour.

Dans du code plus ancien, vous verrez `<ThemeContext.Provider value={theme}>`. Ça fait la même chose : l'écriture plus courte existe depuis React 19.

### Cas d'usage fréquents

- la personne qui utilise l'application ;
- le thème clair ou sombre ;
- la langue de l'interface.

À éviter : mettre tout l'état de l'application dans un contexte. Chaque changement met à jour tous les composants qui le lisent.

### Exercice : « Je suis… » (12 min)

Notre application n'a pas de connexion. On va ajouter un sélecteur pour choisir qui on est (Ada, Grace ou Hedy) et afficher ses tâches différemment.

1. Dans `App`, créez un état `currentUser` qui vaut `"Ada"` au départ.
2. Dans le `<header>`, sous le `<h1>`, ajoutez un sélecteur contrôlé, relié à `currentUser` :

   ```jsx
   <label>
     Je suis
     <select value={...} onChange={...}>
       <option>Ada</option>
       <option>Grace</option>
       <option>Hedy</option>
     </select>
   </label>
   ```

3. Créez un contexte `CurrentUserContext` en dehors des composants, et fournissez-lui la valeur de `currentUser` autour de tout le contenu de `App`.
4. Dans `TaskItem`, lisez le contexte. Si la tâche est assignée à la personne choisie, affichez `<mark>à moi</mark>` à côté du titre.
5. Dans `TaskList`, lisez aussi le contexte : une nouvelle tâche doit être assignée à la personne choisie, et non plus toujours à `"Ada"`.
6. Changez de personne dans le sélecteur et observez les badges.

Question : sans contexte, par quels composants aurait-il fallu faire passer `currentUser` pour qu'il arrive jusqu'à `TaskItem` ?

### Correction en direct

---

## 5. `useMemo` : ne pas refaire un calcul inutilement

### À quoi ça sert

À chaque rendu, tout le code du composant est réexécuté, y compris les calculs. `useMemo` **garde le résultat** d'un calcul et ne le refait que si ses dépendances ont changé.

```jsx
import { useMemo } from "react";

const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => a.price - b.price);
}, [products]); // refait le tri seulement si products change
```

### Cas d'usage fréquents

- filtrer ou trier une longue liste ;
- un calcul coûteux : statistiques, transformation de beaucoup de données…

Attention : sur une liste de cinq tâches, le gain est nul. Mémoriser a aussi un coût. Dans l'exercice, on l'utilise pour **observer le mécanisme**, pas parce que c'est nécessaire ici.

### Exercice : rechercher une tâche (8 min)

1. Dans `TaskList`, ajoutez un état `search`, vide au départ, et un champ de recherche contrôlé au-dessus de la liste : `<input type="search" placeholder="Rechercher" ... />`.
2. Créez une variable `visibleTasks` qui contient seulement les tâches dont le titre contient le texte recherché, sans tenir compte des majuscules. Ajoutez un `console.log("filtrage")` dans votre calcul.
3. Affichez `visibleTasks` au lieu de `tasks` dans la liste. Le compteur de tâches restantes, lui, continue de compter toutes les tâches.
4. **Observez :** tapez dans le champ « Nouvelle tâche ». Est-ce que « filtrage » s'affiche dans la console ? Est-ce logique ?
5. Utilisez `useMemo` pour que le filtrage ne se refasse que lorsque c'est nécessaire. Quelles sont les dépendances ? Vérifiez dans la console.

### Correction en direct

---

## 6. `useCallback` : garder la même fonction

### À quoi ça sert

Une fonction déclarée dans un composant est **recréée à chaque rendu**. Elle fait la même chose, mais pour JavaScript c'est une **nouvelle** fonction :

```js
const a = () => {};
const b = () => {};
a === b; // false
```

Le plus souvent, ça ne pose aucun problème. Ça en devient un quand la fonction est une **dépendance d'un `useEffect`** : l'effet croit qu'elle a changé et se relance à chaque rendu.

`useCallback` garde **la même fonction** d'un rendu à l'autre, tant que ses dépendances ne changent pas :

```jsx
import { useCallback } from "react";

const showMessage = useCallback(() => {
  alert(`Bonjour ${name}`);
}, [name]); // nouvelle fonction seulement si name change
```

### La règle des dépendances

**Tout ce que l'effet utilise et qui vient du composant** (états, props, fonctions) doit apparaître dans son tableau de dépendances. Sinon, l'effet risque de travailler avec d'anciennes valeurs.

Si une fonction ne sert **que** dans l'effet, le plus simple est de la déclarer **à l'intérieur** de l'effet : elle n'est alors plus une dépendance. `useCallback` devient utile quand la fonction sert **aussi ailleurs**.

À savoir : le React Compiler, un outil qu'on peut ajouter à un projet, fait ce travail automatiquement. Vous croiserez quand même `useMemo` et `useCallback` dans beaucoup de projets existants.

### Exercice : un bouton « Recharger » (8 min)

1. Dans `TaskList`, sortez la fonction de chargement de l'effet. Elle devient une fonction `loadTasks` du composant. Elle passe `isLoading` à `true`, charge le fichier, range les tâches, puis passe `isLoading` à `false`.
2. Ajoutez un bouton « Recharger » qui appelle `loadTasks`.
3. Votre effet appelle maintenant `loadTasks()`. D'après la règle des dépendances, ajoutez `loadTasks` dans le tableau de l'effet.
4. **Observez** l'onglet Réseau. Que se passe-t-il ? Expliquez pourquoi, étape par étape.
5. Corrigez avec `useCallback`. Quelles sont les dépendances de `loadTasks` ? Indice : les fonctions `setTasks` et `setIsLoading` ne changent jamais.
6. Vérifiez qu'il n'y a plus qu'une requête au chargement de la page, et une à chaque clic sur « Recharger ».

### Correction en direct

---

## Récapitulatif

### Les deux règles des hooks

1. On appelle les hooks **tout en haut du composant**, jamais dans un `if`, une boucle ou une fonction imbriquée.
2. On les appelle seulement **dans un composant** ou **dans un autre hook**.

### Quel hook pour quel besoin ?

| J'ai besoin de… | Hook |
|---|---|
| me souvenir d'une valeur qui change l'affichage | `useState` |
| agir en dehors de React : charger des données, écouter un événement… | `useEffect` |
| accéder à un élément HTML, ou garder une valeur sans déclencher de rendu | `useRef` |
| partager une valeur avec des composants éloignés | `useContext` |
| éviter de refaire un calcul coûteux | `useMemo` |
| garder la même fonction d'un rendu à l'autre (par exemple pour un `useEffect`) | `useCallback` |

### Pour aller plus loin

- La documentation officielle de chaque hook : [useState](https://react.dev/reference/react/useState), [useEffect](https://react.dev/reference/react/useEffect), [useRef](https://react.dev/reference/react/useRef), [useContext](https://react.dev/reference/react/useContext), [useMemo](https://react.dev/reference/react/useMemo), [useCallback](https://react.dev/reference/react/useCallback)
- [Vous n'avez peut-être pas besoin d'un effet](https://react.dev/learn/you-might-not-need-an-effect), en anglais : les cas où `useEffect` n'est pas la bonne solution
- [La documentation de Pico CSS](https://picocss.com/docs), pour découvrir les autres éléments mis en forme
