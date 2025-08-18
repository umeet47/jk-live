# Encore + Prisma TypeScript Example

This is a RESTful API Starter with [Prisma](https://prisma.io) as ORM to handle database CRUD operations.

## Developing locally

When you have [installed Encore](https://encore.dev/docs/ts/install), you can create a new Encore application and clone this example with this command.

```bash
encore app create --example=ts/prisma
```

## Running locally

```bash
encore run
```

While `encore run` is running, open <http://localhost:9400/> to view Encore's [local developer dashboard](https://encore.dev/docs/ts/observability/dev-dash).

## Configure Prisma

Get the connection string to the shadow database by running:

```
encore db conn-uri encore_prisma_test --shadow

```

Then edit `users/prisma/schema.prisma` replace `<paste shadow db connection string here>` with the output of the above command.

## Using the API

Counts and returns the number of existing users

```bash
curl 'http://localhost:4000/count/users'
```

Create a new user

```bash
curl 'http://localhost:4000/users' -d '{"name":"John","surname":"Doe"}'
```

Get all users data

```bash
curl 'http://localhost:4000/users'

# for paginated data:
curl 'http://localhost:4000/users?page=1&limit=10'
```

Get user data by id

```bash
curl 'http://localhost:4000/users/:id'
```

Update user data

```bash
# partial update
curl -XPATCH 'http://localhost:4000/users/:id' -d '{"data":{"name":"Johnny"}}'

# update complete data
curl -XPATCH 'http://localhost:4000/users/:id' -d '{"data":{"name":"Mary","surname":"Jane"}}'
```

Delete an user by id

```bash
curl -X DELETE 'http://localhost:4000/users/:id'
```

## Deployment

Deploy your application to a staging environment in Encore's free development cloud:

```bash
git add -A .
git commit -m 'Commit message'
git push encore
```

Then head over to the [Cloud Dashboard](https://app.encore.dev) to monitor your deployment and find your production URL.

From there you can also connect your own AWS or GCP account to use for deployment.

Now off you go into the clouds!

```
server {
    server_name app.livetreee.xyz;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    server_name admin.livetreee.xyz;
    location / {
        proxy_pass http://127.0.0.1:9400/g9hwu;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

	# listen 80 default_server;  # Listen on port 80 as the default server
    server_name api.livetreee.xyz;
    location / {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }


    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.livetreee.xyz/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.livetreee.xyz/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = api.livetreee.xyz) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    server_name api.livetreee.xyz;
    listen 80;
    return 404; # managed by Certbot


}
```

```

PORT = 5000
MONGO_URL = "mongodb+srv://foreign-it:Vi2esuQl8WuRYIyX@cluster0.qom4f.mongodb.net/live-stream"

# MONGO_URL = "mongodb+srv://asifullesan345:YeAzeeMz1smbJct0@cluster0.4adtsbs.mongodb.net/live-stream"

JWT_SECRET = kothin_secrete_version_4
Cloud_Name = "dfyessnzj"
Api_Key = "392372746771668"
Api_Secret = "nJeeoPrWrP_eqUtrDqHqHUlWUdI"

# Cloud_Name = "dft1wmdhb"

# Api_Key = "896612876973698"

# Api_Secret = "QvzcqZUEB588k1tjGNWI6Hq39oc"

IP="192.30.242.107"
#IP="0.0.0.0"
#ANNOUNCED_IP="192.30.242.107"

```

server {
server_name app.livetreee.xyz;
location / {
proxy_pass http://127.0.0.1:4000;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
proxy_set_header Host $host;
proxy_cache_bypass $http_upgrade;
}

    server_name admin.livetreee.xyz;
    location / {
        proxy_pass http://127.0.0.1:9400/g9hwu;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    server_name api.livetreee.xyz;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}


so i want you to create diagram which show the flow of the process that i am describing using event. the event is the socket event in server.I will be describing how it is working.The flow is related to live streaming of video/audio. Initial state is that the all user are authenticated and will use the token as authorization key. it contains userId, username and all user info. the socket is also authenticated.
the server and client is using mediasoup for the sfu live streaming video call.
1. so first the host will create a room using the CREATE_ROOM which is emitted from host client side without anypayload. it will use its own userId as roomId to create room. room is a class used for tracking and handling the live streaming.
