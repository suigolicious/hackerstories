import React, { useCallback, useEffect, useReducer, useState } from 'react';
import './App.css'
import {
  SearchProps,
  Stories,
  StoriesObject,
  StoriesReducerAction,
  SearchFormProps
} from './App.d';
import axios from 'axios';

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

  const useStorageState = (key: string, initialState: string) => {
    const [value, setValue] = useState(localStorage.getItem(key) || initialState);

    useEffect(() => {
      localStorage.setItem(key, value);
    }, [value, key]);

    return [value, setValue] as const;
  };

  const [searchTerm, setSearchTerm] = useStorageState('search', '');

  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return;

    dispatchStories({
      type: 'STORIES_FETCH_INIT'
    });

    const result = await axios.get(`${API_ENDPOINT}react`);

    try {
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      });
    } catch {
      dispatchStories({
        type: 'STORIES_FETCH_FAILURE'
      });
    }
  }, []);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleConfirmButton = async (event: React.MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    if (!searchTerm) return;

    const result = await axios.get(`${API_ENDPOINT}${searchTerm}`);

    dispatchStories({
      type: 'STORIES_FETCH_SUCCESS',
      payload: result.data.hits
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

        <SearchForm
          searchTerm={searchTerm}
          onSearchInput={handleInputChange}
          onSearchSubmit={handleConfirmButton}
        />

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

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit }: SearchFormProps) => {
  return (
    <form onSubmit={() => onSearchSubmit}>
      <InputWithLabel
        value={searchTerm}
        id='search'
        onInputChange={onSearchInput}
      >
        <strong>Search: </strong>
      </InputWithLabel>
      <button type="submit" disabled={!searchTerm}>Submit</button>
    </form>
  )
};

const InputWithLabel = ({ type = 'text', value, id, children, onInputChange }: SearchProps) => {
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
