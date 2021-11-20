/** @jsxImportSource @emotion/react */
import "bootstrap/dist/css/bootstrap.min.css";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as firebase from "firebase/firestore/lite";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo6FPvXbnTKAEtKSwZ4FPJYCHDeGjjLSI",
  authDomain: "todo-app-8b046.firebaseapp.com",
  projectId: "todo-app-8b046",
  storageBucket: "todo-app-8b046.appspot.com",
  messagingSenderId: "569068037551",
  appId: "1:569068037551:web:85b9bc0a96cfa3e2c37b5a",
  measurementId: "G-97Y29H2XXH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = firebase.getFirestore(app);

interface ToDoProps {
  id: string;
  index: number;
  title: string;
  description: string;
  completed: boolean;
  handleCompleted: (id: string, index: number, newValue: boolean) => void;
  deleteItem: (id: string, index: number) => void;
  updatingDatabase: boolean;
  deletingFromDatabase: boolean;
}

interface ToDoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

function TodoItem({
  id,
  index,
  title,
  description,
  completed,
  handleCompleted,
  deleteItem,
  updatingDatabase,
  deletingFromDatabase,
}: ToDoProps) {
  return (
    <Accordion.Item eventKey={String(index)}>
      <Accordion.Header>
        <div
          css={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div
            css={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="checkbox"
              id={String(index)}
              checked={completed}
              onClick={() => {
                handleCompleted(id, index, !completed);
              }}
            />
          </div>
          <div css={{ marginLeft: 15, marginRight: "auto" }}>
            <span
              css={{
                fontSize: 24,
                fontWeight: "500",
                textDecoration: completed ? "line-through" : "none",
              }}
            >
              {title}
            </span>
          </div>
          <div css={{}}>
            <Button
              variant="link"
              onClick={() => {
                deleteItem(id, index);
              }}
            >
              {deletingFromDatabase ? "Deleting..." : "Delete item"}
            </Button>
          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body>{description}</Accordion.Body>
    </Accordion.Item>
  );
}

function TodoList() {
  const [todoList, setTodoList] = useState<ToDoItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemCompleted, setNewItemCompleted] = useState(false);
  const [completedItems, setCompletedItems] = useState(0);
  const [addingToDatabase, setAddingToDatabase] = useState(false);
  const [deletingFromDatabase, setDeletingFromDatabase] = useState(false);
  const [updatingDatabase, setUpdatingDatabase] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setLoading(true);
      let todoList: ToDoItem[] = [];
      const todoRef = firebase.collection(firestore, "todos");
      const todoDocs = await firebase.getDocs(todoRef);
      todoDocs.forEach((doc) => {
        const todoItem = doc.data() as ToDoItem;
        todoList.push(todoItem);
      });
      setTodoList(todoList);
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCompleted = async (
    id: string,
    index: number,
    newValue: boolean
  ) => {
    var list = todoList.slice();
    list[index].completed = newValue;
    setTodoList(list);

    let counter = newValue ? completedItems + 1 : completedItems - 1;
    setCompletedItems(counter);

    try {
      setUpdatingDatabase(true);
      const todoRef = firebase.doc(firestore, "todos/" + id);
      await firebase.updateDoc(todoRef, { completed: newValue });
    } catch (error) {
      alert(error);
    } finally {
      setUpdatingDatabase(false);
    }
  };

  async function AddItem() {
    try {
      setAddingToDatabase(true);
      console.log("got here");
      const todo = {
        id: "",
        title: newItemTitle,
        description: newItemDescription,
        completed: newItemCompleted,
      };
      const todosRef = firebase.collection(firestore, "todos");
      const todoRef = await firebase.addDoc(todosRef, todo);
      await firebase.updateDoc(firebase.doc(firestore, "todos/" + todoRef.id), {
        id: todoRef.id,
      });
      todo.id = todoRef.id;
      var list = todoList.slice();
      list = list.concat(todo);
      setTodoList(list);

      setNewItemCompleted(false);
      setNewItemTitle("");
      setNewItemDescription("");
    } catch (error) {
      alert(error);
    } finally {
      setAddingToDatabase(false);
    }
  }

  const deleteItem = async (id: string, index: number) => {
    try {
      var list = todoList.slice();

      let counter = list[index].completed ? completedItems - 1 : completedItems;
      setCompletedItems(counter);

      list.splice(index, 1);
      setTodoList(list);

      const todoRef = firebase.doc(firestore, "todos/" + id);
      await firebase.deleteDoc(todoRef);
    } catch (error) {
      alert(error);
    } finally {
      setDeletingFromDatabase(false);
    }
  };
  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        maxWidth: 1000,
      }}
    >
      {loading ? (
        <div>
          <h2>Loading...</h2>
        </div>
      ) : todoList.length ? (
        <div css={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {todoList.length ? (
            <div>
              <p>Number of items completed: {completedItems}</p>
            </div>
          ) : null}
          <Accordion defaultActiveKey="0" flush>
            {todoList.map((item, index) => {
              return (
                <TodoItem
                  id={item.id}
                  index={index}
                  title={item.title}
                  description={item.description}
                  completed={item.completed}
                  handleCompleted={handleCompleted}
                  deleteItem={deleteItem}
                  updatingDatabase={updatingDatabase}
                  deletingFromDatabase={deletingFromDatabase}
                />
              );
            })}
          </Accordion>
        </div>
      ) : (
        <div>
          <h4>Add a Todo item to get started.</h4>
        </div>
      )}
      <div css={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Accordion defaultActiveKey="0" flush>
          <Accordion.Item eventKey={String(todoList.length + 1)}>
            <Accordion.Header>
              <div
                css={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  css={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newItemCompleted}
                    onClick={(e) => {
                      setNewItemCompleted(!newItemCompleted);
                    }}
                  />
                </div>
                <div css={{ marginLeft: 15 }}>
                  <input
                    css={{ height: 40 }}
                    type="text"
                    placeholder="Title..."
                    value={newItemTitle}
                    onChange={(e) => {
                      setNewItemTitle(e.target.value);
                    }}
                  />
                </div>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <textarea
                css={{ width: "100%" }}
                placeholder="Description..."
                value={newItemDescription}
                onChange={(e) => {
                  setNewItemDescription(e.target.value);
                }}
              ></textarea>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <div
        css={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Button onClick={AddItem}>
          {addingToDatabase ? "Adding item" : "Add item"}
        </Button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div
      css={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div css={{}}>
        <h1>Todo List</h1>
      </div>
      <TodoList />
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
