IMAGE_REGISTRY=dockerhub
IMAGE_NAMESPACE ?= hyperjump
IMAGE_NAME ?= monika
COMMIT_ID ?= $(shell git rev-parse --short HEAD)


docker:
	docker build -t $(IMAGE_NAMESPACE)/$(IMAGE_NAME):$(COMMIT_ID) -f ./Dockerfile .

docker-tag: docker
	docker tag $(IMAGE_NAMESPACE)/$(IMAGE_NAME):$(COMMIT_ID) $(IMAGE_NAMESPACE)/$(IMAGE_NAME):latest

docker-push: docker-tag
	docker push $(IMAGE_NAMESPACE)/$(IMAGE_NAME):latest

docker-stop:
	-docker stop $(IMAGE_NAME)

docker-rm: docker-stop
	-docker rm $(IMAGE_NAME)

docker-run: docker-rm docker
	docker run --name $(IMAGE_NAME) -v $(PWD)/monika.example.yml:/config/monika.yml --detach $(IMAGE_NAMESPACE)/$(IMAGE_NAME):$(COMMIT_ID)


NODE_BIN ?= $(shell asdf which node 2>/dev/null || nvm which node 2>/dev/null || command -v node)
UNAME_S := $(shell uname -s)
JS_FILES := $(shell git ls-files '*.js')

# build the `monika` binary
#
# https://nodejs.org/api/single-executable-applications.html
#
# $@ means "the name of this target", which is "dist/monika" in this case
dist/monika: clean-dist dist/bundle.js
	node --experimental-sea-config sea-config.json
	cp $(NODE_BIN) $@
	strip $@
ifeq ($(UNAME_S),Darwin)
	codesign --remove-signature $@
	npx postject $@ NODE_SEA_BLOB dist/sea-prep.blob \
		--sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
		--macho-segment-name NODE_SEA 
	codesign --sign - $@
else
	npx postject $@ NODE_SEA_BLOB dist/sea-prep.blob \
		--sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
endif
	./dist/monika -v

# Create a bundled version of the app, so that we can build an executable out
# of it.
dist/bundle.js: $(JS_FILES)
	npx esbuild \
		--format=cjs \
		--target=node20 \
		--platform=node \
		--bundle \
		--outfile=$@ \
		./bin/run.js 

clean-dist:
	# rm dist/*
