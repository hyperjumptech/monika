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
