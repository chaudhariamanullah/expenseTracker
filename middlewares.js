require("dotenv").config();
const jwt = require("jsonwebtoken");
const authMiddleware = (req,res,next) =>{
    if (!req.user)
        return res.redirect("/expense/login");
    next();
}

const isLoggedIn = (req,res,next) =>{

    const token = req.cookies.token;

    if (!token){
        req.user = null;
        return next();
    } 

    try{
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch (err){
        res.status(400).json({ message: "Invalid token" });
    }
}

module.exports = {authMiddleware,isLoggedIn};