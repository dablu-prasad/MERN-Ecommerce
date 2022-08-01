// Create Token and saving in cookies

const dotenv=require("dotenv");
dotenv.config({path:"backend/config/config.env"});


const sendToken=(user,statusCode,res)=>{
    const token=user.getJWTToken();

   // console.log(process.env.COOKIE_EXPIRE * 24 * 60 * 1000)
    //option for cookies
    const options={
        expires:new Date( 
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 1000 
        ),
        httpOnly:true,
    };

   // console.log("options is :",options)

    res.status(statusCode).cookie("token",token,options).json({
        success:true,
        user,
        token,
    });
};

module.exports=sendToken;