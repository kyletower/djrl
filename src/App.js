import './App.css';
import Navbar from './Navbar';
import Search from './Search';
import SongQueue from './SongQueue';

import { useState, useEffect } from 'react';

export const sortByTime = 'sortByTime';
export const sortByVotes = 'sortByVotes';
export const userId =
  localStorage.getItem('userId') || localStorage.setItem('userId', Date.now());

function App() {
  // initial render
  useEffect(() => {
    console.log({ userId });
    console.log('use effect ran');
    loadQueue();
  }, []);

  // reactive vars, show/hide
  const [queue, setQueue] = useState([]);
  const [showSearch, setShowSearch] = useState(true);
  const [showQueue, setShowQueue] = useState(true);
  const [sortOrder, setSortOrder] = useState(sortByVotes);
  const [onlyMyRequests, setOnlyMyRequests] = useState(false);

  const showHideSearch = () => {
    setShowSearch(!showSearch);
  };

  const showHideQueue = () => {
    setShowQueue(!showQueue);
  };

  const loadQueue = () => {
    console.log({ onlyMyRequests });
    fetch('http://localhost:8000/queue')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.table(data);
        setQueue(data);
      });
  };

  const upVote = (song) => {
    updateVotes(song, 'upVotes');
  };

  const downVote = (song) => {
    updateVotes(song, 'downVotes');
  };

  // vote will be the attribute upVotes or downVotes
  const updateVotes = (song, votes) => {
    const updatedVotes = song[votes] + 1;

    fetch('http://localhost:8000/queue/' + song.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [votes]: updatedVotes,
      }),
    })
      .then((res) => res.json())
      .then((json) => console.table('json', json));

    // update gui for upVotes
    queue.forEach((q) => {
      if (q.id === song.id) {
        q[votes] += 1;
        setQueue([...queue]);
      }
    });
  };

  const addToQueue = (songTitle, artistName, mbid, albumArt, event) => {
    // create newSong object with 1 upVotes
    const newSong = {
      songTitle,
      artistName,
      upVotes: 1,
      downVotes: 0,
      mbid,
      albumArt,
      userId,
    };

    // handle duplicates
    let duplicate = false;
    // array.filter((item, index) => array.indexOf(item) === index);
    // array = [... new Set(array)]
    queue.forEach((request) => {
      if (
        newSong.songTitle === request.songTitle &&
        newSong.artistName === request.artistName
      ) {
        duplicate = true;
        console.log(
          'this song has already been requested',
          request.upVotes,
          'times'
        );
        updateVotes(request, 'upVotes');
        return; // why doesn't this exit the addToQueue function?, it only exits the .forEach?
      }
    });

    if (duplicate) {
      // change color to green and switch + to ✅ when added
      event.target.parentElement.classList.add('added-to-queue');
      event.target.innerText = '✅';
      return;
    }

    fetch('http://localhost:8000/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSong),
    })
      .then((res) => res.json())
      .then((data) => {
        setQueue([data, ...queue]);
      });

    // change color to green and switch + to ✅ when added
    event.target.parentElement.classList.add('added-to-queue');
    event.target.innerText = '✅';
    console.log(event);
  };

  const markAsPlayed = (id) => {
    // perhaps this object should be removed from the db.queue and added to the db.played
    // need to make this reactive so that result is visibly removed without refreshing
    fetch('http://localhost:8000/queue/' + id, {
      method: 'DELETE',
    }).then(() => {
      // update gui, could do this client side to avoid requesting from server, using .filter()
      loadQueue();
    });
  };

  return (
    <div className='App'>
      <div className='flex-container'>
        <Navbar showHideSearch={showHideSearch} showHideQueue={showHideQueue} />

        {showSearch && <Search addToQueue={addToQueue} />}
        {showQueue && queue && (
          <SongQueue
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onlyMyRequests={onlyMyRequests}
            setOnlyMyRequests={setOnlyMyRequests}
            queue={queue}
            upVote={upVote}
            downVote={downVote}
            markAsPlayed={markAsPlayed}
          />
        )}
      </div>
      <p>end of div in app.js</p>
    </div>
  );
}

export default App;
