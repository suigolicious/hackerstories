import { useEffect, useReducer, useState } from 'react';
import './App.css'
import {
  SearchProps,
  Stories,
  StoriesObject,
  StoriesReducerAction
} from './App.d'

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const storiesReducer = (state: Array<StoriesObject>, action: StoriesReducerAction) => {
    // all returns update 'state' -> stories [{},{},...]
    switch (action.type) {
      case 'SET_STORIES':
        return action.payload;
      case 'REMOVE_STORIES':
        return state.filter((story: StoriesObject) => {
          return !story.objectID.toString().includes(action.payload?.objectID);
        })
      case 'STORIES_FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case 'STORIES_FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case 'STORIES_FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        }
      default:
        throw new Error();
    }
  };

  const [stories, dispatchStories] = useReducer(storiesReducer, []);

  useEffect(() => {
    fetch(`${API_ENDPOINT}react`)
      .then((response) => response.json()
        .then((result) => {
          dispatchStories({
            type: 'STORIES_FETCH_SUCCESS',
            payload: result.hits
          });
        }).catch(() => {
          dispatchStories({
            type: 'STORIES_FETCH_FAILURE'
          });
        }));
  }, []);

  const useStorageState = (key: string, initialState: string) => {
    const [value, setValue] = useState(localStorage.getItem(key) || initialState);

    useEffect(() => {
      localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue] as const;
  };

  const [searchTerm, setSearchTerm] = useStorageState('search', '');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleConfirmButton = () => {
    if (searchTerm === '') return;

    fetch(`${API_ENDPOINT}${searchTerm}`)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.hits
        });
      });
  };

  const handleDelete = (item: StoriesObject) => {
    dispatchStories({
      type: 'REMOVE_STORIES',
      payload: item
    });
  };

  return (
    <>
      <div>
        <h1>My Hacker Stories</h1>

        <InputWithLabel
          value={searchTerm}
          id='search'
          onInputChange={handleInputChange}
          handleConfirmButton={handleConfirmButton}
        >
          <strong>Search: </strong>
        </InputWithLabel>

        {stories.isError && <p>Something went wrong...</p>}

        {stories.isLoading ? (
          <p>List is loading...</p>
        ) : (
          <List
            list={stories.data}
            onDeleteButtonClick={handleDelete}
          />
        )}
      </div>
    </>
  )
}

const InputWithLabel = ({ type = 'text', value, id, children, onInputChange, handleConfirmButton }: SearchProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(event);
  };

  return (
    <>
      <label htmlFor={id}>{children}</label>
      <input
        onChange={handleChange}
        id={id}
        type={type}
        value={value}
      >
      </input>
      <button onClick={() => handleConfirmButton()}>Confirm</button>
    </>
  )
}

const List = ({ list, onDeleteButtonClick }: Stories) => {
  return (
    <ul>
      {list?.map((item: StoriesObject) => {
        return (
          <Item
            key={list.objectID}
            {...item}
            onDeleteButtonClick={onDeleteButtonClick}
          />
        )
      })}
    </ul>
  )
}

const Item = ({ title, url, objectID, author, num_comments, points, onConfirmButtonClick }: Stories) => {
  return (
    <li key={objectID}>
      <span>
        <a href={url}>{title}</a>
      </span>
      <span>{author}</span>
      <span>{num_comments}</span>
      <span>{points}</span>
      <span>
        <button id={objectID} onClick={onConfirmButtonClick}>Remove</button>
      </span>
    </li>
  )
}

export default App
