function importAll(r) {
	console.log("importing modules:", r.keys());
	console.log($);
	r.keys().forEach(r);
}

importAll(require.context('./menulist', true, /\.js$/));
