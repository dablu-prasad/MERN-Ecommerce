const Product=require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const ApiFeatures=require("../utils/apifeatures");
//Create Product -admin
exports.createProduct=catchAsyncErrors(async (req,res,next)=>{
    console.log(req.body)
    console.log(req.user)
   req.body.user=req.user.id;
   const product=await Product.create(req.body);
    product.save();
    res.status(201).json({
        success:true,
        product
    })
});


// get all Product
exports.getAllProducts=catchAsyncErrors(async(req,res)=>{
    const resultPerPage=5;
    const productCount=await Product.countDocuments();
    const ApiFeature=new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
    const products= await ApiFeature.query;
 //const products=await Product.find();

    res.status(200).json({
        success:true,
        products
    })
});

//get Product Details
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);

       // if(!product)
    // {
    //     return res.status(500).json({
    //         success:false,
    //         message:"Product not found"
    //     })
    // }

    if(!product)
    {
        return next(new ErrorHander("Product not found",404));    
    }
    res.status(200).json({
        success:true,
        product,
        productCount
    })
});


// update Product
exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);
    // if(!product)
    // {
    //     return res.status(500).json({
    //         success:false,
    //         message:"Product not found"
    //     })
    // }
    if(!product)
    {
        return next(new ErrorHander("Product not found",404));    
    }

    product =await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:"ok",
        product
    })
});

//delete Product
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);

    // if(!product)
    // {
    //     return res.status(500).json({
    //         success:false,
    //         message:"Product  not found"
    //     })
    // }
    if(!product)
    {
        return next(new ErrorHander("Product not found",404));    
    }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product Delete Successfully"
    })
})