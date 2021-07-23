import './App.css';
import Navbar from './Navbar';
import Search from './Search';
import SongQueue from './SongQueue';
import { useState, useEffect } from 'react';

export const sortByTime = 'sortByTime';
export const sortByVotes = 'sortByVotes';

let userId = localStorage.getItem('userId');
if (!userId) {
  localStorage.setItem('userId', Date.now());
  userId = localStorage.getItem('userId');
}
export { userId };

let userUpVotedArray = [];
let userUpVoted = localStorage.getItem('userUpVoted');
if (!userUpVoted) {
  localStorage.setItem('userUpVoted', JSON.stringify([]));
  userUpVoted = localStorage.getItem('userUpVoted');
}

let userDownVotedArray = [];
let userDownVoted = localStorage.getItem('userDownVoted');
if (!userDownVoted) {
  localStorage.setItem('userDownVoted', JSON.stringify([]));
  userDownVoted = localStorage.getItem('userDownVoted');
}

function App() {
  // initial render
  useEffect(() => {
    console.log('use effect ran');
    console.log({ userId });
    console.log({ userUpVoted });
    console.log({ userDownVoted });
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
    userUpVotedArray = JSON.parse(localStorage.getItem('userUpVoted'));

    // register or deregister up vote
    if (!userUpVotedArray.includes(song.id)) {
      registerUpVote(song);
    } else {
      // deregister up vote from local storage
      deregisterUpVote(song);
    }
  };

  const downVote = (song) => {
    userDownVotedArray = JSON.parse(localStorage.getItem('userDownVoted'));

    // register or deregister down vote
    if (!userDownVotedArray.includes(song.id)) {
      registerDownVote(song);
    } else {
      deregisterDownVote(song);
    }
  };

  const registerUpVote = (song) => {
    userUpVotedArray.push(song.id);
    localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));
    updateVotes(song, 'upVotes', 1);

    if (userDownVotedArray.includes(song.id)) {
      deregisterDownVote(song);
    }
  };

  const registerDownVote = (song) => {
    userDownVotedArray.push(song.id);
    localStorage.setItem('userDownVoted', JSON.stringify(userDownVotedArray));
    updateVotes(song, 'downVotes', 1);

    if (userUpVotedArray.includes(song.id)) {
      deregisterUpVote(song);
    }
  };

  const deregisterUpVote = (song) => {
    userUpVotedArray.splice(userUpVotedArray.indexOf(song.id));
    localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));
    updateVotes(song, 'upVotes', -1);
  };

  const deregisterDownVote = (song) => {
    userDownVotedArray.splice(userDownVotedArray.indexOf(song.id));
    localStorage.setItem('userDownVoted', JSON.stringify(userDownVotedArray));
    updateVotes(song, 'downVotes', -1);
  };

  // vote will be the attribute upVotes or downVotes
  const updateVotes = (song, votes, value) => {
    const updatedVotes = song[votes] + value;

    // patch
    fetch('http://localhost:8000/queue/' + song.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [votes]: updatedVotes,
      }),
    }).then((res) => res.json());
    // .then((json) => console.table('json from db.json', json));

    // update gui for upVotes
    queue.forEach((q) => {
      if (q.id === song.id) {
        q[votes] += value;
        setQueue([...queue]);
      }
    });
  };

  // add the search request song to the queue
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
      // if newSong has laready been requested then don't add it, just up vote it
      if (
        newSong.songTitle === request.songTitle &&
        newSong.artistName === request.artistName
      ) {
        duplicate = true;
        upVote(request);
        return; // why doesn't this exit the addToQueue function?, it only exits the .forEach?
      }
    });

    // update gui to a checkmark even if it's a duplicate for user feedback
    if (duplicate) {
      // change color to green and switch + to ✅ when added
      event.target.parentElement.previousSibling.classList.add(
        'added-to-queue'
      );
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
        // register vote
        userUpVotedArray.push(data.id);
        localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));

        setQueue([data, ...queue]);
      });

    // change color to green and switch + to ✅ when added
    event.target.parentElement.previousSibling.classList.add('added-to-queue');
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
      <div className='app-container'>
        <div className='view-options-container'>
          <Navbar
            showHideSearch={showHideSearch}
            showHideQueue={showHideQueue}
          />
        </div>
        <div className='search-container'>
          {showSearch && <Search addToQueue={addToQueue} />}
        </div>
        <div className='queue-container'>
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
      </div>
    </div>
  );
}

export default App;
