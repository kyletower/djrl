import { useState } from 'react';
import SearchResults from './SearchResults';

export const API_KEY = 'e4de1cb320336b47aba4805ec9cc8dee';

const Search = ({ addToQueue }) => {
  const MINIMUM_SEARCH_LENGTH = 2;
  const NUMBER_OF_SEARCH_RESULTS = 5;
  const [searchResults, setSearchResults] = useState([]);

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }
  function handleChange(event) {
    // console.log('Saving data');
    // debounce this, underscore, lodash
    // take input
    const input = event.target.value;
    if (input.length < MINIMUM_SEARCH_LENGTH) {
      setSearchResults('');
      return;
    }

    //make request
    // `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${'migraine'}&track=${'migraine'}&format=json`

    fetch(
      `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${input}&api_key=${API_KEY}&limit=${NUMBER_OF_SEARCH_RESULTS}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        // parse response
        console.log(data);
        setSearchResults(data.results.trackmatches.track);
      });
  }
  const processChange = debounce((event) => handleChange(event));

  // When the user starts typing we want to search for a song using the last.fm api
  // function handleChange(event) {
  //   // debounce this, underscore, lodash
  //   // take input
  //   const input = event.target.value;
  //   if (input.length < MINIMUM_SEARCH_LENGTH) {
  //     setSearchResults('');
  //     return;
  //   }

  //   //make request
  //   // `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${'migraine'}&track=${'migraine'}&format=json`

  //   fetch(
  //     `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${input}&api_key=${API_KEY}&limit=${NUMBER_OF_SEARCH_RESULTS}&format=json`
  //   )
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // parse response
  //       console.log(data);
  //       setSearchResults(data.results.trackmatches.track);
  //     });
  // }
  return (
    <>
      <h2>Search</h2>
      <input
        type='text'
        placeholder='🔎Type the title of a song and/or an artist...'
        autoFocus
        size='70'
        onChange={processChange}
      ></input>
      {searchResults.length > 0 && (
        <SearchResults searchResults={searchResults} addToQueue={addToQueue} />
      )}
    </>
  );
};

export default Search;
