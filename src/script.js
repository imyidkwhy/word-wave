const coversGrid = document.getElementById('covers-grid')


async function getSongs() {
    try {
        const response = await fetch('./songs.json');
        const songs = await response.json()
        console.log(songs);
        function displaySongsCover(songs) {
            songs.forEach(song => {
                const songCard = document.createElement('div')
                songCard.classList.add('song-card')
                songCard.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <p>${song.title}</p>
                 `
                coversGrid.appendChild(songCard);
            })


        }
        displaySongsCover(songs)
    } catch (error) {
        console.error("an error occured", error);

    }
}
getSongs()