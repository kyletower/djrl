import { useState, useEffect } from 'react';

// https://www.freecodecamp.org/news/javascript-debounce-example/

const API_KEY = 'e4de1cb320336b47aba4805ec9cc8dee';
// localStorage to track whether local user has up/downvoted.
const SearchResults = ({ searchResults, addToQueue }) => {
  const [images, setImages] = useState({});

  useEffect(() => {
    searchResults.forEach((searchResult, i) => {
      const { name, artist, mbid } = searchResult;

      // make request for album cover art
      // `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&mbid=${mbid}&track=${name}&artist=${artist}&format=json`

      fetch(
        `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&mbid=${mbid}&track=${name}&artist=${artist}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.track?.album?.image[0]?.['#text']) {
            const url = data.track.album.image[0]['#text'];
            console.log({ url });
            setImages((state) => ({ ...state, [i]: url }));
          }
        })
        .catch((err) => {
          console.error('ERROR:', err);
        });
    });
  }, [searchResults]);
  console.log({ images });
  return (
    <>
      <h3>Results</h3>
      {searchResults.map((searchResult, i) => {
        const { name, artist, mbid } = searchResult;
        return (
          <div className='search-result'>
            <div className='album-art'>
              <img
                src={
                  images[i] ||
                  'https://www.last.fm/static/images/defaults/player_default_album.430223706b14.png'
                }
                width='34'
                // remove width
                alt=''
              />
            </div>
            <div className='song-info'>
              <p className='song-name'>{name}</p>
              <p className='artist-name'>{artist}</p>
            </div>
            <div className='add-to-queue'>
              <button
                className='btn-add-to-queue'
                onClick={(event) =>
                  addToQueue(name, artist, mbid, images[i], event)
                }
              >
                ➕
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default SearchResults;
