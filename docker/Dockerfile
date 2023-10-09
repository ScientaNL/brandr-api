FROM node:20-slim

RUN apt-get update \
    && apt-get install -y \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
	wget \
	gnupg \
	dirmngr \
	python3 \
	build-essential \
    dumb-init \
	ca-certificates \
      --no-install-recommends \
	&& wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
	&& sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
	&& apt-get update \
	&& apt-get install -y google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb \
    && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Use installed chromium
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-unstable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Set language to UTF8
ENV LANG="C.UTF-8"

# Helps GitHub track the version number
ARG API_VERSION
ENV API_VERSION="${API_VERSION}"

WORKDIR /app

RUN wget -P /app/resources/hosts-blocklist https://github.com/notracking/hosts-blocklists/raw/master/domains.txt

COPY ./app ./
RUN yarn set version stable && yarn install --immutable

RUN mkdir -p /output

# Run custom commands by overwriting docker entrypoint
COPY ./docker/docker-node-entrypoint /usr/local/bin
RUN chmod +x /usr/local/bin/docker-node-entrypoint

# Setup the puppeteer user
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /output
USER pptruser

ENTRYPOINT ["dumb-init", "--"]

CMD [ "yarn", "run", "start" ]
