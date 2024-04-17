from lyricy import Lyricy

l = Lyricy()
results = l.search("My Stupid Heart")

selected_lyrics = results[0]
selected_lyrics.fetch()

selected_lyrics.lyrics
selected_lyrics.lyrics_without_lrc_tags

selected_lyrics.save("My Stupid Heart1.lrc")
selected_lyrics.add_to_track("test.mp3")