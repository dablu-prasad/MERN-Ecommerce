const ErrorHander=require("../utils/errorhander");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const User=require("../models/userModel");
const sendToken=require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");

//Register a User
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const user=await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"this is a simple id",
            url:"profilepicUrl",
        },
    });

// const token=user.getJWTToken();

//     res.status(201).json({
//         success:true,
//        // user,
//        token,
//     });

sendToken(user,201,res);
});

//Login User
exports.loginUser =catchAsyncErrors(async(req,res,next)=>{
    const {email,password} =req.body;

    //checking if user has given password and email both
    if(!email || !password)
    {
        return next(new ErrorHander("Please Enter Email & Password",400));
    }

    const user= await User.findOne({email}).select("+password");
    if(!user)
    {
        return next(new ErrorHander("Invalid email or password",401));
    }

    const isPasswordMatched= await user.comparePassword(password);

    if(!isPasswordMatched)
    {
        return next(new ErrorHander("Invalid email or password",401));
    }

    // const token=user.getJWTToken();
    // res.status(200).json({
    //     success:true,
    //     token,
    // });

    sendToken(user,201,res);
});

//Logout User
exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });

    res.status(200).json({
        success:true,
        message:"Logged Out",
    });
});

// Forget Password
exports.forgotPassword= catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});

    if(!user)
    {
        return next(new ErrorHander("User not found",404));
    }

    //GET ResetPassword Token
    const resetToken=user.getResetPasswordToken();

    console.log(resetToken)
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
    const message=`Your password reset token is:-\n\n ${resetPasswordUrl} \n\n If you have
    not requested this email then,please ignoure it.`;
    console.log(resetPasswordUrl)
    console.log(user.email)
    try{
        await sendEmail({
          email:user.email,
          subject:`Ecommerce password Recovery`,
          message,
        });

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        });
    }
    catch(error)
    {
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHander(error.message,500));
    }
});

//Reset Password
exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
    //creating token hash
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token)
    .digest("hex");

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });
    if(!user)
    {
        return next(new ErrorHander("Reset Password Token is invalid or has been expired",400));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();
    sendToken(user,200,res);
})

//Get User Details
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
});

// update User password

exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id).select("+password");
    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHander("old password is incorrect",400));

    }
    if(req.body.newPassword !== req.body.confirmPassword)
    {
        return next(new ErrorHander("password does not match",400));
    }
    user.password=req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
})

// update User profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }
    //We will add cloudinary later
    const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });
    res.status(200).json({
        success:true,
        user
    })
})

//Get all users(admin)
exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
    const users=await User.find();

    res.status(200).json({
        success:true,
        users,
    });
});

//Get single user (admin)
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHander(`User doesnot exists with id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user,
    });
});

//update user Role -admin
exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    };
    const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,
    });
});

//Delete User --Admin
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
    const user=User.findById(req.params.id);

    //We will remove cloudinary later
    if(!user)
    {
        return next(new ErrorHander(`User does not exist with id: ${req.params.id}`));
    }

    await user.remove();
    res.status(200).json({
        success:true,
        message:"User Deleted Successfully"
    });
});
