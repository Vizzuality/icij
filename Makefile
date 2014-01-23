
UGLIFYJS = ./node_modules/.bin/uglifyjs
JS_FILES = js/vendor/fullscreen.js js/map.js js/app.js

compress:
	cat $(JS_FILES) > js/app.uncompressed.js
	$(UGLIFYJS) js/app.uncompressed.js > js/app.compressed.js