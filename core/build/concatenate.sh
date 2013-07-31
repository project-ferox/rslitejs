mkdir -p ../dist

cat ../src/rslite-head.js \
../src/RequestHandler.js \
../src/Pipeline.js \
../src/pipeline_handlers/RequestBuilder.js \
../src/pipeline_handlers/RequestSender.js \
../src/pipeline_handlers/Aborter.js \
../src/rslite-tail.js \
> ../dist/rslite-core-debug.js
