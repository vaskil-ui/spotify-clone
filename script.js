let currentSong = new Audio();

function secondsToMinutes(seconds) {
    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zeros if needed
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const paddedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    // Return the formatted string
    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs() {
    // Fetch the song list from the /songs directory
    let response = await fetch("/songs/");  // Use a relative path if served locally
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let links = div.getElementsByTagName("a");
    let songs = [];

    // Loop through all links to find mp3 files
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(link.href.split("/songs/")[1]);  // Get only the filename part of the URL
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = "/songs/" + track;  // Use a relative path from the root for local server

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";  // Change play button to pause button
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function main() {
    // Get the list of all songs
    let songs = await getSongs();
    playMusic(songs[0], true);  // Start by playing the first song

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>VASKIL</div>
                </div>
                <div class="playNow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach an event listener to each song to play it when clicked
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    // Attach an event listener to the play button
    const play = document.getElementById('play');  // Ensure you're selecting the correct element
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";  // Switch to pause icon
        } else {
            currentSong.pause();
            play.src = "play.svg";   // Switch to play icon
        }
    });

    // Listening for time update event to display current time and duration
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}/${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to the seekbar for seeking through the track
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });
}

main();
