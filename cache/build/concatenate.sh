mkdir -p ../dist

cat ../src/cache-head.js \
../src/Cache.js \
../src/CacheHandler.js \
../src/cache-tail.js \
> ../dist/rslite-cache-debug.js
