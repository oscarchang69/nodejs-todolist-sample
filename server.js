const { Console } = require('console');
const http = require('http');
const { json } = require('stream/consumers');
const { v4: uuidv4 } = require('uuid');
const errHandle = require('./errorHandle');

const todos = [
];

const requestListener = (req, res) => {

    // const q = req.url.toString().startsWith('/todos/');
    // console.log('q', q);

    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }


    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });


    if (req.url == '/todos' && req.method == "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos
        }));
        res.end();
    } else if (req.url == '/todos' && req.method == 'POST') {

        req.on('end', () => {
            try {
                const title = JSON.parse(body).title;
                console.log('title', title);

                if (title !== undefined) {

                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    };
                    todos.push(todo);
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos
                    }));

                    res.end();

                } else {
                    errHandle(res);
                }
            } catch (error) {
                console.log('catch');
                errHandle(res);
            }
        });

    } else if (req.url == "/todos" && req.method == 'DELETE') {
        console.log('req.url', req.url);
        todos.length = 0;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos
        }));
        console.log('delete all');
        res.end();

    } else if (req.url.toString().startsWith("/todos/") && req.method == "DELETE") {
        // console.log('in');

        const id = req.url.toString().split('/').pop();
        console.log(todos);
        const index = todos.findIndex(element => element.id == id);
        console.log(id, index);
        if (index != -1) {
            todos.splice(index, 1);
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos
            }));
            res.end();
        } else {
            errHandle(res);
        }

    }
    else if (req.url.toString().startsWith('/todos/') && req.method == 'PATCH') {

        req.on('end', () => {
            try {
                const title = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(e => e.id == id);
                if (title !== undefined && index !== -1) {
                    todos[index].title = title;
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status":"success",
                        "data":todos
                    }));
                }else{
                    console.log('123');
                    errHandle(res);
                }
                res.end();
            } catch (err) {
                console.log('456');
                errHandle(res);
            }


        });

    }
    else if (req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    }
    else {
        console.log('catch error');
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "fail",
            "message": "無此網站路由"
        }));
        res.end();
    }

};

const server = http.createServer(requestListener);

server.listen(process.env.port || 3005)