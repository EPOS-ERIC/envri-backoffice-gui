FROM nginx:stable-alpine

ENV SERVER_NAME=_ \
    BASE_URL=/ \
    API_HOST=http://gateway:5000

COPY dist/browser/ /opt/epos-backoffice-gui/
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /opt/epos-backoffice-gui/

CMD ["sh", "-c", "sed -Ei 's|<base href=\"[^\"]*\"[[:space:]]*/?>|<base href=\"'$BASE_URL'\">|g' /opt/epos-backoffice-gui/index.html && sed -i 's|SERVER_NAME|'$SERVER_NAME'|g' /etc/nginx/conf.d/default.conf && sed -i 's|BASE_URL|'$BASE_URL'|g' /etc/nginx/conf.d/default.conf && sed -i 's|API_HOST|'$API_HOST'|g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

EXPOSE 80
