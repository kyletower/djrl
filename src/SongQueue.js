// rename Queue.js
// perhaps make a ShowSongs.js component and pass the Queue as a prop,
// and/or pass the Search Results as a prop.
import { sortByTime, sortByVotes } from './App';
import { userId } from './App';
import { useState } from 'react';

const SongQueue = ({
  sortOrder,
  setSortOrder,
  onlyMyRequests,
  setOnlyMyRequests,
  queue,
  upVote,
  downVote,
  markAsPlayed,
}) => {
  if (sortOrder === sortByVotes) {
    queue.sort((a, b) => {
      return b.upVotes - a.upVotes;
      // a.upVotes < b.upVotes ? 1 : -1
      // b.upVotes - b.downVotes - (a.upVotes - a.downVotes);
    });
  } else if (sortOrder === sortByTime) {
    queue.sort((a, b) => {
      return b.id - a.id;
    });
  }

  // let [songsToDisplay, setSongsToDisplay] = useState(queue);
  let songsToDisplay = queue;
  if (onlyMyRequests) {
    // setSongsToDisplay(queue.filter((request) => request.userId === userId));
    songsToDisplay = queue.filter((request) => request.userId === userId);
  }

  return (
    <>
      <h2>Queue</h2>
      <button onClick={() => setOnlyMyRequests(!onlyMyRequests)}>
        My/All Requests
      </button>
      <button
        onClick={() =>
          setSortOrder(sortOrder === sortByVotes ? sortByTime : sortByVotes)
        }
      >
        Sort By Likes/Time Added
      </button>

      <DisplaySongs
        songsToDisplay={songsToDisplay}
        upVote={upVote}
        downVote={downVote}
        markAsPlayed={markAsPlayed}
      />
    </>
  );
};

export default SongQueue;

const DisplaySongs = ({ songsToDisplay, upVote, downVote, markAsPlayed }) => {
  return songsToDisplay.map((song) => {
    return (
      <div className='queue-item' key={song.id}>
        <div className='album-art'>
          <img
            src={
              song.albumArt ||
              'https://www.last.fm/static/images/defaults/player_default_album.430223706b14.png'
            }
            width='34'
            alt=''
          />
        </div>
        <div className='song-info'>
          <p className='song-name'>{song.songTitle}</p>
          <p className='artist-name'>{song.artistName}</p>
        </div>
        <div className='vote'>
          <button onClick={() => upVote(song)}>
            {song.upVotes}
            <span className='emoji'>👍</span>
          </button>
          <button onClick={() => markAsPlayed(song.id)}>
            <span className='emoji'>▶️</span>
          </button>
          <button onClick={() => downVote(song)}>
            {song.downVotes}
            <span className='emoji'>👎</span>
          </button>
        </div>
      </div>
    );
  });
};
