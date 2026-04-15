FROM nginx:stable-alpine

ENV SERVER_NAME=_ \
    BASE_URL=/ \
    API_HOST=http://gateway:5000 \
    AUTH_ROOT_URL=https://login.staging.envri.eu/auth/realms/envri

COPY dist/browser/ /opt/epos-backoffice-gui/
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /opt/epos-backoffice-gui/

CMD escaped_auth_root_url=$(printf '%s' "$AUTH_ROOT_URL" | sed 's/[&|]/\\&/g') && \
    find /opt/epos-backoffice-gui -name '*.js' -exec sed -i "s|__AUTH_ROOT_URL__|$escaped_auth_root_url|g" {} \; && \
    sed -Ei 's|<base href="[^"]*"[[:space:]]*/?>|<base href="'$BASE_URL'">|g' /opt/epos-backoffice-gui/index.html && \
    sed -i 's|SERVER_NAME|'$SERVER_NAME'|g' /etc/nginx/conf.d/default.conf && \
    sed -i 's|BASE_URL|'$BASE_URL'|g' /etc/nginx/conf.d/default.conf && \
    sed -i 's|API_HOST|'$API_HOST'|g' /etc/nginx/conf.d/default.conf && \
    nginx -g "daemon off;"

EXPOSE 80
