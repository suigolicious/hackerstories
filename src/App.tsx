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
  // const initialStories = [
  //   {
  //     title: 'React',
  //     url: 'https://reactjs.org/',
  //     author: 'Linda Sui',
  //     num_comments: 3,
  //     points: 4,
  //     objectID: 0,
  //   },
  //   {
  //     title: 'Redux',
  //     url: 'https://redux.js.org/',
  //     author: 'Dan',
  //     num_comments: 2,
  //     points: 5,
  //     objectID: 1,
  //   },
  // ];

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

  const [searchTerm, setSearchTerm] = useStorageState('search', 'React');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.data?.filter((story: StoriesObject) => {
    const storyTitle = story.title.toLowerCase();
    return storyTitle.includes(searchTerm.toLowerCase());
  });

  const handleDelete = (item: StoriesObject) => {
    dispatchStories({
      type: 'REMOVE_STORIES',
      payload: item
    });
  }

  return (
    <>
      <div>
        <h1>My Hacker Stories</h1>

        <InputWithLabel
          onInputChange={handleSearch}
          value={searchTerm}
          id='search'
        >
          <strong>Search: </strong>
        </InputWithLabel>

        {stories.isError && <p>Something went wrong...</p>}

        {stories.isLoading ? (
          <p>List is loading...</p>
        ) : (
          <List
            list={searchedStories}
            onButtonClick={handleDelete}
          />
        )}
      </div>
    </>
  )
}

const InputWithLabel = ({ type = 'text', value, onInputChange, id, children }: SearchProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(event);
  };

  return (
    <>
      <label htmlFor={id}>{children}</label>
      <input
        id={id}
        type={type}
        onChange={handleChange}
        value={value}
      >
      </input>
    </>
  )
}

const List = ({ list, onButtonClick }: Stories) => {
  return (
    <ul>
      {list?.map((item: StoriesObject) => {
        return (
          <Item
            key={list.objectID}
            {...item}
            onButtonClick={onButtonClick}
          />
        )
      })}
    </ul>
  )
}

const Item = ({ title, url, objectID, author, num_comments, points, onButtonClick }: Stories) => {
  return (
    <li key={objectID}>
      <span>
        <a href={url}>{title}</a>
      </span>
      <span>{author}</span>
      <span>{num_comments}</span>
      <span>{points}</span>
      <span>
        <button id={objectID} onClick={onButtonClick}>Remove</button>
      </span>
    </li>
  )
}

export default App
