import './App.css';
import Navbar from './Navbar';
import Search from './Search';
import SongQueue from './SongQueue';

import { useState, useEffect } from 'react';

export const sortByTime = 'sortByTime';
export const sortByVotes = 'sortByVotes';
export const userId =
  localStorage.getItem('userId') || localStorage.setItem('userId', Date.now());

let userUpVotedArray = [];
let userUpVoted =
  localStorage.getItem('userUpVoted') ||
  localStorage.setItem('userUpVoted', JSON.stringify([]));

let userDownVotedArray = [];
let userDownVoted =
  localStorage.getItem('userDownVoted') ||
  localStorage.setItem('userDownVoted', JSON.stringify([]));

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
    let value = 1;
    userUpVotedArray = JSON.parse(localStorage.getItem('userUpVoted'));

    if (userUpVotedArray.includes(song.id)) {
      console.log(`you've already up voted that song, removing your vote`);
      // change value to -1 instead of +1
      value = -1;
    }

    // register or unregister up vote
    if (value === 1) {
      // register user up vote
      userUpVotedArray.push(song.id);
      localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));
    } else if (value === -1) {
      // unregister up vote from local storage
      userUpVotedArray.splice(userUpVotedArray.indexOf(song.id));
      localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));
    }

    updateVotes(song, 'upVotes', value);
  };

  const downVote = (song) => {
    let value = 1;
    userDownVotedArray = JSON.parse(localStorage.getItem('userDownVoted'));

    if (userDownVotedArray.includes(song.id)) {
      console.log(`you've already up down voted that song, removing your vote`);
      // change value to -1 instead of +1
      value = -1;
    }

    // register or unregister up vote
    if (value === 1) {
      // register user down vote
      userDownVotedArray.push(song.id);
      localStorage.setItem('userDownVoted', JSON.stringify(userDownVotedArray));
    } else if (value === -1) {
      // unregister down vote from local storage
      userDownVotedArray.splice(userDownVotedArray.indexOf(song.id));
      localStorage.setItem('userDownVoted', JSON.stringify(userDownVotedArray));
    }

    updateVotes(song, 'downVotes', value);
  };

  // vote will be the attribute upVotes or downVotes
  const updateVotes = (song, votes, value) => {
    // let value = 1;
    // userUpVotedArray = JSON.parse(localStorage.getItem('userUpVoted'));

    // if (userUpVotedArray.includes(song.id)) {
    //   console.log(`you've already up voted that song, removing your vote`);

    //   // change value to -1 instead of +1
    //   value = -1;
    // }

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

    // // register or unregister up vote
    // if (value === 1) {
    //   // register user up vote
    //   userUpVotedArray.push(song.id);
    //   localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));
    // } else if (value === -1) {
    //   // unregister up vote from local storage
    //   userUpVotedArray.splice(userUpVotedArray.indexOf(song.id));
    //   localStorage.setItem('userUpVoted', JSON.stringify(userUpVotedArray));
    // }
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
        updateVotes(request, 'upVotes');
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
