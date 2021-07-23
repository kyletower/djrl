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

export default DisplaySongs;
