import { Suspense, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import Card from './Card';

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

// Here we are using the type Todo, so that we can use intellisense from Typescript on the returned data, 
// else data will be type any
const getTodos = async (): Promise<Todo[]> => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
};


const getTodosbyId = async (id: string) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${id}`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return await response.json();
};


function App() {
  const [on, setOn] = useState(true);
  const [id, setId] = useState(1);


  // ---- Querys ----
  const { data: todos, isPending: isTodosPending, error: todosError, refetch: refetchTodos } = useQuery({
    queryKey: ['todos', id],
    queryFn: getTodos,
    enabled: on, // Only run this query if `on` is true
  });


  // Here we are using useSuspenseQuery - which ensures that "data" is never undefined. 
  // This can be useful when using TypeScript, which complains about "data" being undefined.
  // you CANNOT use useSuspenseQuery with enabled
  const { data: todoById, isPending: isTodoByIdPending, error: todoByIdError, refetch: refetchTodoById } = useSuspenseQuery({
    queryKey: ['todoById', id],
    queryFn: () => getTodosbyId(id.toString()), // Pass the `id` to the query function
  });


  // ---- Error handling ----
  if (todosError) {
    return <div>Error fetching todos: {todosError.message}</div>;
  }

  if (todoByIdError) {
    return <div>Error fetching todo by ID: {todoByIdError.message}</div>;
  }


  // ---- JSX (main) ----
  return (
    <>
      <div className="App">
        <hr />
        <br />

        <div>
          <div>POST ID: 1 </div>
          <div>{JSON.stringify(todoById.slice(1)[0])}</div>
        </div>

        <hr />
        <br />


        {isTodosPending ?
          (<img src={reactLogo} className="logo react" alt="React logo" />

          ) : todos ? (
            <div>
              <div>Title: {todos[0].title}</div>
              <div>{JSON.stringify(todos.slice(0, 10))}</div>
            </div>
          ) : (
            <p>No Data Available</p>
          )
        }</div>

      <button onClick={() => refetchTodos()}>Refetch</button>

    </>
  );
}

export default App;




// ---- Using Suspense in React ----
// This is a simple example of using Suspense in React.
// It is used to show a fallback UI while the data is being fetched.
// It is used to show a loading spinner or a message while the data is being fetched.
// You can use it with the useSuspenseQuery hook from react-query.
// This is an effective way to handle loading states in React.
// Because Suspense is a React feature, it will recognize any components that are in a suspense state.
// This means that when used with useSuspenseQuery, it will automatically show the fallback UI while the data is being fetched.
export const usingSuspenseInReact = () => {

  return (
    <>
      <Suspense fallback={<div>Loading Spinner Component Here...</div>}>
        <Card />
      </Suspense>
    </>
  );
};


//---- Using multiple queries ----
// You can use multiple queries in a single tanstack query.
// you can als do this with -- useSuspenseQueries --
// Note this wont work if you need to use the queries in order like you need one to run before the other can work
export const usingMultipleQueries = () => {
  // you can destructer the returned values or just put them under a variable name and use them
  const [result1, result2]  = useQueries({
    queries: [
      {
        queryKey: ['todos'],
        queryFn: () => getTodos(),
      },
      {
        queryKey: ['todoById', '1'],
        queryFn: () => getTodosbyId('1'),
      },
    ],
  });

  return (
    <>
      <div>
        {result1.error ? (
          <div>Error: {result1.error.message}</div>
        ) : (
          <div>
            <h1>Todos</h1>
            <ul>
              {result2?.data.map((todo) => (
                <li key={todo.id}>{todo.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};