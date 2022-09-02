const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const secret = "secret";
const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pass1 = process.env.pass1;
const pass2 = process.env.pass2;

const users = [
    {
        username: "user1",
        password: pass1
    },
    {
        username: "user2",
        password: pass2
    }
]

const oauth = async (req, res, next)  => {
    const bearerHeader = req.headers["authorization"];
    try {
        
        const token = bearerHeader.split(' ')[1];
        await jwt.verify(token, secret);
        req.token = token;

        next();
    }catch(err) {
        res.sendStatus(403);
    }
}

app.get("/", oauth, async (req, res) => {
    try {
        res.json({
            message: "Hello from product microservice"
        });
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

app.post("/sign-in", async (req, res) => {
    const { username, password } = req.body;
    
    const _filteredUser = users.filter((user)=> {
        if(user.username == username && user.password == password )
            return user;
    })

    if (!_filteredUser)
        return res
            .status(400)
            .json({
                message: "Invalid user or password"
            })

    const token = jwt.sign({
        username,
        password
    }, secret);
    
    res.status(200).json({
        token,
        sub: _filteredUser[0].username
    })
})

app.listen(port, () => {
    console.log(`running on port ${port}`);
})
