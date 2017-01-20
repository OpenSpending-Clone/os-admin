FROM sickp/alpine-nginx

RUN rm /etc/nginx/nginx.conf /etc/nginx/mime.types

RUN apk add --update git nodejs
RUN update-ca-certificates
RUN cd $(npm root -g)/npm \
 && npm install fs-extra \
 && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js
RUN npm install npm@latest -g
RUN npm --version
RUN git clone http://github.com/openspending/os-admin.git app
RUN cd app && npm install
RUN cd app && npm run build
RUN cd app && (find . -type f | grep -v /public/ | grep -v index.html | grep -v config.json | grep -v favicon.ico | tee | xargs rm)

RUN rm -rf /var/cache/apk/*

COPY docker/startup.sh /startup.sh
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/mime.types /etc/nginx/mime.types
COPY docker/default /etc/nginx/sites-enabled/default

EXPOSE 8000

CMD /startup.sh
