// rename Queue.js
// perhaps make a ShowSongs.js component and pass the Queue as a prop,
// and/or pass the Search Results as a prop.
import { sortByTime, sortByVotes } from './App';
import { userId } from './App';
import DisplaySongs from './DisplaySongs';
import { useState } from 'react';

const SongQueue = ({ queue, upVote, downVote, markAsPlayed }) => {
  const [sortOrder, setSortOrder] = useState(sortByVotes);
  const [onlyMyRequests, setOnlyMyRequests] = useState(false);

  // consider moving this sort logic up to App.js where the buttons reside
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

  // consider moving this requests logic up to App.js where the buttons reside
  let songsToDisplay = queue;
  if (onlyMyRequests) {
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
