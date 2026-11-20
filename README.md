# Sidequest Scribe 📖🎮

A library-themed quest journal for all your games. Runs on iPhone as an installable, offline web app.

## Install with GitHub Pages
1. Create a new **public** repo on GitHub, for example `sidequest-scribe`.
2. Unzip this folder, then upload **everything inside it** to the root of the repo:
   `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `README.md`, and the `icons/` folder.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then pick **main** and **/ (root)**, and click **Save**.
4. Wait about a minute, then open `https://<your-username>.github.io/sidequest-scribe/` in **Safari** on your iPhone.
5. Tap **Share → Add to Home Screen**, then launch it from the new icon.

## Using it
- **Tap a book** to pull it off the shelf and open it. **Press and hold a book** to customize it.
- **Type a note and press Enter (send)**, or tap the quill, to log an entry. It gets the date and time automatically.
- **Use the camera button** to take a photo or pick a screenshot from your library.
- **Use the tag chips** (Boss, Loot, Lore, Died, Secret, Milestone…) to label entries. Search and filter them with the magnifier.
- **Check the Memories and Stats tabs** to see your screenshot wall, streaks, peak gaming hour, and more.
- **Open ⚙ Settings** to change the theme, control sound, update weather and location, back up and restore, and view achievements.

## Backups
Go to **Settings → Export Library**, then tap **Save Backup** and choose **Save to Files** or iCloud Drive.
To restore, go to **Settings → Restore** and pick the `.json` file. Restoring replaces the current library.

## Sky window
The window uses the free **Open-Meteo** API, so you don't need an API key. Your location is checked again every 30 days, and the sky refreshes every 30 minutes while the app is open. Time of day follows your real sunrise and sunset.

## Updating later
After you change files, bump `CACHE` in `sw.js`, for example `v1.0.1`, so iPhones pick up the new version.
