FROM node:12.18-alpine

WORKDIR /app

# Create a group and user
RUN addgroup -g 1005 appgroup

RUN adduser -D -u 1001 appuser -G appgroup

RUN chown -R appuser:appgroup /app

USER appuser

COPY --chown=appuser:appgroup . .

RUN  npm install

CMD [ "npm", "start" ]
