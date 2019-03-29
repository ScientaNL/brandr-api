FROM ubuntu:xenial

RUN apt-get update && apt-get install -y \
	curl \
	git

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
	&& curl -sL https://deb.nodesource.com/setup_10.x | bash - \
	&& curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
	&& echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update && apt-get install -y \
	nodejs \
	yarn \
	libcairo2-dev \
	libjpeg-dev \
	libpango1.0-dev \
	libgif-dev \
	libpng-dev \
	build-essential \
	g++

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

RUN yarn global add nodemon

WORKDIR /usr/src/app

# Run custom commands by overwriting docker entrypoint
COPY ./docker/docker-node-entrypoint /usr/local/bin
RUN chmod +x /usr/local/bin/docker-node-entrypoint

# Install app dependencies
COPY ./app /usr/src/app/
RUN yarn install

ENTRYPOINT ["docker-node-entrypoint"]

EXPOSE 80
CMD [ "node", "/usr/src/app/index.js" ]
