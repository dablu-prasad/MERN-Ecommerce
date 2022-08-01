const ErrorHander=require("../utils/errorhander");

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.message=err.message || "Internal Server Error";

    //Wrong Mongodb id error
    if(err.name=="CastError")
    {
        const message=`Resource not found. Invalid: ${err.path}`;
        err=new ErrorHander(message,400);
    }

    res.status(err.statusCode).json({
        success:false,
       // err:err.stack,
       message:err.message,
    })
}